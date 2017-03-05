var express = require('express');
var router = express.Router();
var Crawler = require('../crawler.js');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { message : "" });
});

/* POST url */
router.post('/', function (req, res, next) {
	var url = req.body.url;
	var crawler = new Crawler(url);
	crawler.crawl(url, function() {
		crawler.scrape_static_assets(function() {
			crawler.static_assets_to_JSON(function(assets) {
				console.log(assets);
				res.render('index', { message : assets});
			});
		});
	});
});

module.exports = router;
