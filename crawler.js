var request = require('request');
var jquery = require('jquery');
var cheerio = require('cheerio');
var url = require('url');

function Crawler(base_url) {
    if (arguments.length > 1 || arguments.length < 1) {
        throw new Error("WebCrawler takes a single URL when initialized.");
    }
    if (typeof base_url !== "string") {
        throw new Error("WebCrawler needs a URL string for the base url.");
    }
	Crawler.base_url = base_url;
	Crawler.pages_visited = {};
	Crawler.pages_to_visit = [];
	Crawler.crawl_counter = 0;
	Crawler.static_assets = [];
}

Crawler.prototype.start = function(callback) {
	console.log(url.parse(Crawler.base_url).href);
	Crawler.pages_to_visit.push(url.parse(Crawler.base_url).href);
	console.log("Crawler first page pushed: " + Crawler.pages_to_visit);
	Crawler.prototype.crawl(function() {
		console.log("Crawling complete.");
		console.log(Crawler.static_assets);
	});
}

Crawler.prototype.crawl = function(callback) {
	var next_page = Crawler.pages_to_visit.pop();
	if (next_page == undefined) {
		console.log('next_page is undefined so stopping crawl.');
		callback();
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
	   if(response.statusCode === 404) {
	   	console.log("Error 404 attempting to visit page: " + url);
		callback();
	   }
	});
}

Crawler.prototype.collect_internal_links = function($) {
	var all_relative_links = [];
	var all_absolute_links = [];

	var relative_links = $("a[href^='/']");
	relative_links.each(function() {
		all_relative_links.push($(this).attr('href'));
	});

	var absolute_links = $("a[href^='http']");
	absolute_links.each(function() {
	  all_absolute_links.push($(this).attr('href'));
	});

	console.log("Found " + all_relative_links.length + " relative links");
	console.log("Found " + all_absolute_links.length + " absolute links");

	relative_links.each(function() {
		Crawler.pages_to_visit.push(Crawler.base_url + $(this).attr('href'))
	});
}

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