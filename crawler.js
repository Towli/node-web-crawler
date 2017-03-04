var request = require('request');
var jquery = require('jquery');
var jsdom = require('jsdom');

var Crawler = {};

Crawler.crawl = function(url, callback) {
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

Crawler.parse_static_assets = function() {
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
		//console.log(final_static_assets);
	});
}

Crawler.static_assets_to_JSON = function(callback) {
	var static_assets_JSON = {
		url : ""
	};
	var assets = [];

	for (var i in Crawler.static_assets)
		assets[i] = Crawler.static_assets[i];

	static_assets_JSON.assets = assets;
	callback(static_assets_JSON);
}

module.exports = Crawler;