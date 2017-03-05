var request = require('request');
var jquery = require('jquery');
var cheerio = require('cheerio');
var url = require('url');

function CheerioCrawler(base_url) {
    if (arguments.length > 1 || arguments.length < 1) {
        throw new Error("WebCrawler takes a single URL when initialized.");
    }
    if (typeof base_url !== "string") {
        throw new Error("WebCrawler needs a URL string for the base url.");
    }
	CheerioCrawler.base_url = base_url;
	CheerioCrawler.pages_visited = {};
	CheerioCrawler.pages_to_visit = [];
	CheerioCrawler.crawl_counter = 0;
}

CheerioCrawler.prototype.start = function(callback) {
	console.log(url.parse(CheerioCrawler.base_url).href);
	CheerioCrawler.pages_to_visit.push(url.parse(CheerioCrawler.base_url).href);
	console.log("CheerioCrawler first page pushed: " + CheerioCrawler.pages_to_visit);
	CheerioCrawler.prototype.crawl(function() {
		console.log("Crawling complete.");
		callback();
	});
}

CheerioCrawler.prototype.crawl = function(callback) {
	var next_page = CheerioCrawler.pages_to_visit.pop();
	if (next_page == undefined) {
		console.log('next_page is undefined so stopping crawl.');
		return;
	}
	console.log('Crawl #' + ++CheerioCrawler.crawl_counter);
	console.log(next_page);
	if (next_page in CheerioCrawler.pages_visited) {
		// Already visited this page, so repeat the crawl
		console.log(next_page + ' already visited - Repeating crawl...');
		console.log('sanity check: ' + next_page + " | " + JSON.stringify(CheerioCrawler.pages_visited));
		CheerioCrawler.prototype.crawl(url, callback);
	}
	else {
		CheerioCrawler.prototype.visit_page(next_page, function() {
			console.log("Page " + next_page + " successfully visited.");
			CheerioCrawler.prototype.crawl(callback);
		});	// New page we haven't visited
	}
}

CheerioCrawler.prototype.visit_page = function(url, callback) {
	CheerioCrawler.pages_visited[url] = true;	// Add visit page to the set
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
	     CheerioCrawler.prototype.collect_internal_links($);
	     callback();
	   }
	});
}

CheerioCrawler.prototype.collect_internal_links = function($) {
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
		CheerioCrawler.pages_to_visit.push(CheerioCrawler.base_url + $(this).attr('href'))
	});
}

module.exports = CheerioCrawler;