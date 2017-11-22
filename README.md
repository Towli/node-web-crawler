Simple Web Crawler
==================

A simple non-concurrent web crawler web application.

Given a starting URL, this crawler will visit every reachable page under it's given domain. It will not cross sub-domains.

For each page it visits, it determines the URLs of every static asset on that page:
- Images
- Javascripts
- Stylesheets

## Installation

	Using npm or any live-reload utility, run the server and navigate to http://localhost:8000 (by default).

	```
		npm start app.js
	```

	To change the port the server is running on, change the following line in the bin/www folder:
	```
		var port = normalizePort(process.env.PORT || '8000');
	```

## Usage
	
	The web crawler works well sitting with middleware since the callback of the start() 
	function can be used to render a page, passing the retrieved static assets.

	### Implementation

	```
		var Crawler = require([PATH TO CRAWLER.JS]);
		
		var crawler = new Crawler([A URL]);
		crawler.start(function() {
			// Your callback here
		});
	```

	Example run:
	```
		var crawler = new Crawler('https://brew.sh/');
			crawler.start(function() {
				// Your callback here
			});
	```
	Results in the following JSON:
	```
		[ { url: 'https://brew.sh/',
	    assets:
	     [ 'http://brew.sh/',
	       'http://brew.sh/atom.xml',
	       '/img/favicon.ico',
	       '/img/favicon-16x16.png',
	       '/img/favicon-32x32.png',
	       '/img/favicon-96x96.png',
	       ... ] 
	       			} ]
	```
       (and so on).

	### Usage though Web Interface
	Given a URL through the web UI, the crawler will begin crawling. As the crawler does not run concurrently, the execution time may take a few minutes depending on the website.

	Upon passing a URL and pressing 'Crawl', a series of STDOUTs will be printed (visible through the terminal session running the server). When the crawler is finished, a concatenated JSON will be returned through both STDOUT and also in the Web App, displaying a mapping of all the static assets on the navigable domain.

	Note: the crawler can be used outside of a web-app context as well.

## Dependencies

- Express
- Request
- jQuery
- Cheerio
- url
