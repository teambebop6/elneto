app = require('./globals');


// app = require('https://code.jquery.com/jquery-2.2.4.min.js');
app = require('../vendor/justifiedGallery/less/justifiedGallery.less');
app = require('../vendor/justifiedGallery/js/jquery.justifiedGallery.js');

app.then(function(){
	require('../vendor/justifiedGallery/less/justifiedGallery.less');
	require('../vendor/justifiedGallery/js/jquery.justifiedGallery.js');
	require(['jquery'], function($){

		$('#basicExample').justifiedGallery({
			rowHeight : 300,
			lastRow : 'nojustify',
			margins : 10
		});

		// Load Galery cat stuff...
		//requirejs(['js/galery-cat']);
	});
});



