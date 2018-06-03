require('../less/main.less');
require('../vendor/justifiedGallery/less/justifiedGallery.less');
require('../vendor/semantic/dist/semantic.min.css');
require('../less/galery.less');
require('../less/jcarousel.basic.less');
// justifiedGallery
require('../vendor/justifiedGallery/js/jquery.justifiedGallery.js');

const common = new Promise(function(resolve, reject){
	require(['jquery'], function($){

		jQuery = $;
		window.jQuery = jQuery;
		window.$ = $;

		// justifiedGallery
		require('../vendor/justifiedGallery/js/jquery.justifiedGallery.js');
    	// Semantic js
    	require('../vendor/semantic/dist/semantic.min.js');

		$('#basicExample').justifiedGallery({
			rowHeight : 300,
			lastRow : 'nojustify',
			margins : 10
		});

    	// Resolve promise
    	resolve();
    });
});

module.exports = common;

