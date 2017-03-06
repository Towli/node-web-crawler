var express = require('express');
var router = express.Router();
var Crawler = require('../crawler.js');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { message : "", pages : "" });
});

/* POST url */
router.post('/', function (req, res, next) {
	var url = req.body.url;
	var crawler = new Crawler(url);
	crawler.start();
});

module.exports = router;
