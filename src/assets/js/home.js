var app = require('./globals');


app.then(function(){

	if ( $(window).width() > 1080) {      
		$('.menuBar .menu a').click(function(e) {
			e.preventDefault();
			$('.menuBar').addClass('goToTop');
			var $a = $(this).addClass('active');
			setTimeout(function() {
				window.location.assign($a.attr('href'));
			}, 500);
		});
	} 
	else {
		$('.menuBar .menu a').click(function(e) {
			e.preventDefault();
			var $a = $(this).addClass('active');
			$('.mask').css('opacity','1');
			setTimeout(function() {
				window.location.assign($a.attr('href'));
			}, 500);
		});
	}



	require(['../vendor/jcarousel/jcarousel.basic.css']);

	require(['../vendor/jcarousel/jquery.jcarousel.min', '../vendor/jcarousel/jcarousel.basic'], function(){
	});
});
