var request = require('request');
var jquery = require('jquery');
var cheerio = require('cheerio');
var url = require('url');

function CheerioCrawler(baseURL) {
    if (arguments.length > 1 || arguments.length < 1) {
        throw new Error("WebCrawler takes a single URL when initialized.");
    }
    if (typeof baseURL !== "string") {
        throw new Error("WebCrawler needs a URL string for the base url.");
    }
	CheerioCrawler.baseURL = baseURL;
	CheerioCrawler.queue = [];
}

CheerioCrawler.prototype.crawl = function(url, callback) {
	request(url, function (err, response, body) {	
	   if (err) { 
	   	console.log("Error: " + err);
	   }
	   // Check status code
	   console.log("Status code: " + response.statusCode);
	   if(response.statusCode === 200) {
	     // Parse the DOM body
	     var $ = cheerio.load(body);
	     console.log("Page title:  " + $('title').text());
	   }
	});
}

module.exports = CheerioCrawler;