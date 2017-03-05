var request = require('request');
var jquery = require('jquery');
var jsdom = require('jsdom');

/* Creates a new Crawler */
function Crawler(baseURL) {
    if (arguments.length > 1 || arguments.length < 1) {
        throw new Error("WebCrawler takes a single URL when initialized.");
    }
    if (typeof baseURL !== "string") {
        throw new Error("WebCrawler needs a URL string for the base url.");
    }
	Crawler.baseURL = baseURL;
}

Crawler.prototype.crawl = function(url, callback) {
	console.log("crawling in my skin...");
	request({uri: url}, function (err, response, body) {	
		if (err && response.statusCode !== 200) {
			console.log('Request error.');
		} else {
			Crawler.url = url;
			Crawler.body = body;
			callback();
		}
	});
}

Crawler.prototype.scrape_static_assets = function(callback) {
	jsdom.env(Crawler.body, [jquery], function(err, window) {
		if (err) throw err;
		var final_static_assets = [];
		var $ = require('jquery')(window);
		var $head = $('head');
		var $body = $('body');

		var static_assets_JSON = {
			scripts: $head.find('script'),
			links: $head.find('link'),
			images: $body.find('img') 
		};

		static_assets_JSON.scripts.each(function(i, item) {
			final_static_assets.push($(item).attr('src'));
		});

		static_assets_JSON.links.each(function(i, item) {
			final_static_assets.push($(item).attr('href'));
		});

		static_assets_JSON.images.each(function(i, item) {
			final_static_assets.push($(item).attr('src'));
		});

		Crawler.static_assets = final_static_assets;

		callback();
	});
}

Crawler.prototype.static_assets_to_JSON = function(callback) {
	var assets = Crawler.static_assets;
	var static_assets_JSON = {
		url: Crawler.baseURL,
		assets: assets
	};
	callback(static_assets_JSON);
}

module.exports = Crawler;