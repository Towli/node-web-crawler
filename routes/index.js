var express = require('express');
var router = express.Router();
var crawler = require('../crawler.js');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { message : "" });
});

router.post('/', function (req, res, next) {
	var url = req.body.url;
	var message = "";
	crawler.crawl(url, function() {
		crawler.parse_static_assets();
		res.render('index', { message : crawler.body });
	});
});

module.exports = router;
