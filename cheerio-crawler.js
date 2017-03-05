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
	CheerioCrawler.pages_to_visit = {};
}

CheerioCrawler.prototype.start = function(callback) {
	CheerioCrawler.prototype.crawl(CheerioCrawler.base_url);
	callback();
}

CheerioCrawler.prototype.crawl = function(url, callback) {
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
}

module.exports = CheerioCrawler;