require('../less/main.less');
require('../vendor/semantic/dist/semantic.min.css');
require('../less/galery.less');
require('../less/jcarousel.basic.less');

var common = new Promise(function(resolve, reject){
	require(['jquery'], function($){

		jQuery = $;
		window.jQuery = jQuery;
		window.$ = $;

		$( document ).ready(function() {
			$('.mask').css('opacity','0');
		});
		
		$('.menuBar .title').click(function(e) {
			e.preventDefault();
			$('.mask').css('opacity','1');
			$('.menuBar .menu a').removeClass('active');
			setTimeout(function() {
				window.location.assign($('.menuBar > a').attr('href'));
			}, 500);
		});

		$('.menuBar.goToTop .menu a').click(function(e) {
			e.preventDefault();
			var $a = $(this).addClass('active');
			$('.mask').css('opacity','1');
			setTimeout(function() {
				window.location.assign($a.attr('href'));
			}, 500);
		});

    // Semantic js
    require('../vendor/semantic/dist/semantic.min.js');

    // Resolve promise
    resolve();
});
});

module.exports = common;
