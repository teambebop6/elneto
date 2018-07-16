require('../less/yonny.less');
var app = require("./globals");
require('../vendor/slick-1.8.1/slick/slick.less');
require('../vendor/slick-1.8.1/slick/slick-theme.less');
require('../vendor/slick-1.8.1/slick/slick.js');

app.then(function(){


	// $('.yes').click(function(){
	// 		alert('asdfadsf');
	// 		// $('.imageWrapper').css('left','150vw');
	// 		// setTimeout(function() {
	// 		// 	$('.yonny_poem_wrapper').css('left','100vw');
	// 		// }, 300);

	// 	})


	$('.responsive').slick({
		// dots: true,
		infinite: true,
		speed: 500,
		// slidesToShow: 5,
		centerMode: true,
		autoplay: true,
		autoplaySpeed: 2000,
		slidesToScroll: 1,
		variableWidth: true
	});



});
