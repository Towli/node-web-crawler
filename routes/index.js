var express = require('express');
var router = express.Router();
var Crawler = require('../crawler.js');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { assets : "" });
});

/* POST url */
router.post('/', function (req, res, next) {
	var url = req.body.url;
	var crawler = new Crawler(url);
	crawler.start(function() {
		res.render('index', { assets : JSON.stringify(Crawler.static_assets, null, 2) });
	});
});

module.exports = router;
