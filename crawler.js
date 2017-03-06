var request = require('request');
var jquery = require('jquery');
var cheerio = require('cheerio');
var url = require('url');

/**
 * Constructor for a Crawler object. Initialises the core components used to model 
 * queues for visiting pages in sequence, storage for asset scraping
 * @param  {base_url}	The base (starting) url of crawler
 */
function Crawler(base_url) {
    if (arguments.length > 1 || arguments.length < 1) {
        throw new Error("WebCrawler takes a single URL when initialized.");
    }
    if (typeof base_url !== "string") {
        throw new Error("WebCrawler needs a URL string for the base url.");
    }
	Crawler.base_url = Crawler.remove_trailing_slash(base_url);
	Crawler.pages_visited = {};
	Crawler.pages_to_visit = [];
	Crawler.crawl_counter = 0;
	Crawler.static_assets = [];
}

/**
 * Removes a trailing slash from a given URL
 */
Crawler.remove_trailing_slash = function(url) {
	return url.replace(/\/$/, "");
}

/**
 * Stores the first page to visit onto the queue ready for crawling, and
 * calls the crawl() function to begin the crawling process
 * @param  {callback}
 */
Crawler.prototype.start = function(callback) {
	Crawler.pages_to_visit.push(url.parse(Crawler.base_url).href);
	console.log("Crawler first page pushed: " + Crawler.pages_to_visit);
	Crawler.prototype.crawl(function() {
		console.log("Crawling complete.");
		console.log(Crawler.static_assets);
		callback();
	});
}

/**
 * Begins the crawling process by popping the next page to visit from the queue
 * and determining whether it is crawlable and/or whether it has already been
 * visited. This function will execute recursively until the base case is met
 * Base case: (next_page === undefined)
 * @param  {callback}
 */
Crawler.prototype.crawl = function(callback) {
	var next_page = Crawler.pages_to_visit.pop();
	if (next_page === undefined) {
		console.log('next_page is undefined so finishing the crawl.');
		callback();
		return;
	}
	console.log('Crawl #' + ++Crawler.crawl_counter);
	console.log(next_page);
	if (next_page in Crawler.pages_visited) {
		// Already visited this page, so repeat the crawl
		console.log(next_page + ' already visited - Repeating crawl...');
		Crawler.prototype.crawl(callback);
	}
	else {
		Crawler.prototype.visit_page(next_page, function() {
			console.log("Page " + next_page + " successfully visited.");
			Crawler.prototype.crawl(callback);
		});	// New page we haven't visited
	}
}

/**
 * Sends a request to the given URL, loads and then stores the DOM locally.
 * The DOM object is passed to collect_internal_links() and scrape_static_assets()
 * functions for the scraping phases of the crawl
 * @param  {url} 
 * @param  {callback}
 */
Crawler.prototype.visit_page = function(url, callback) {
	Crawler.pages_visited[url] = true;	// Add visit page to the set
	console.log("Added " + url + " to pages_visited.");
	console.log("Crawling page: " + url);
	request(url, function (err, response, body) {	
		if (err) { 
			console.log("Error: " + err);
		}
		// Check status code
		console.log("Status code: " + response.statusCode);

		if(response.statusCode === 200) {
			// Parse the DOM body
			var $ = cheerio.load(body);
			Crawler.prototype.collect_internal_links($);
			Crawler.prototype.scrape_static_assets(url, $, function() {
				callback();
			});
		}

		if(response.statusCode === 403) {
			console.log("Error 403 attempting to visit page: " + url);
			callback();
		}

		if(response.statusCode === 404) {
			console.log("Error 404 attempting to visit page: " + url);
			callback();
		}

		if(response.statusCode === 500) {
			console.log("Error 404 attempting to visit page: " + url);
			callback();
		}
	});
}

/**
 * Scrapes and stores all internal links of the current DOM body and stores
 * the relative links into the Crawler's queue of pages to visit
 * @param  {$}	
 */
Crawler.prototype.collect_internal_links = function($) {
	var all_relative_links = [];
	var all_absolute_links = [];

	var relative_links = $('body').find("a[href^='/']");
	relative_links.each(function() {
		all_relative_links.push($(this).attr('href'));
	});

	/*var absolute_links = $("a[href^='http']");
	absolute_links.each(function() {
		all_absolute_links.push($(this).attr('href'));
	});*/

	console.log("Found " + all_relative_links.length + " relative links");
	//console.log("Found " + all_absolute_links.length + " absolute links");

	var resolved_link = "";
	relative_links.each(function(i, item) {
		resolved_link = Crawler.base_url + $(this).attr('href');
		if (resolved_link !== undefined) {
			if (!(resolved_link in Crawler.pages_visited) && !(resolved_link in Crawler.pages_to_visit))
			Crawler.pages_to_visit.push(Crawler.base_url + $(this).attr('href'));
		}	
	});
}

/**
 * Scrapes all static assets from the current DOM body by use of jQuery to scope
 * and select scripts, links, and images from their respective html tags
 * @param  {url}
 * @param  {$}
 * @param  {callback}
 */
Crawler.prototype.scrape_static_assets = function(url, $, callback) {
	var $head = $('head');
	var $body = $('body');
	var scraped_assets = [];

	var static_assets_JSON = {
		scripts: $head.find('script'),
		links: $head.find('link'),
		images: $body.find('img') 
	};

	for (var key in static_assets_JSON) {
		static_assets_JSON[key].each(function(i, item) {
			if ($(item).attr('src') !== undefined)
				scraped_assets.push($(item).attr('src'));
			else if ($(item).attr('href') !== undefined)
				scraped_assets.push($(item).attr('href'));
		});
	}

	var scraped_assets_JSON = {
		url: url,
		assets: scraped_assets
	};
	Crawler.static_assets.push(scraped_assets_JSON);
	callback();
}

module.exports = Crawler;