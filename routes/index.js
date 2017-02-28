var express = require('express');
var router = express.Router();
var crawler = require('../crawler.js');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { message : "" });
});

router.post('/', function (req, res, next) {
	var url = req.body.url;
	var message = crawler(url);
	res.render('index', { message : message });
});

module.exports = router;
