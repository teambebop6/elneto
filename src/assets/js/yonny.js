require('../less/yonny.less');
var app = require("./globals");
require('../vendor/slick-1.8.1/slick/slick.less');
require('../vendor/slick-1.8.1/slick/slick-theme.less');
require('../vendor/slick-1.8.1/slick/slick.js');

app.then(function(){



	var justifiedGallery = require(['justifiedGallery'], function(){
		console.log("loaded justified galery22");

		$('#enFotos').justifiedGallery({
			rowHeight : 230,
			lastRow : 'nojustify',
			maxRowHeight: 380,
			randomize: true,
			margins : 30
		});
	});





	$('.responsive').slick({
		// dots: true,
		infinite: true,
		speed: 5000,
		// slidesToShow: 5,
		centerMode: true,
		autoplay: true,
		autoplaySpeed: 10000,
		slidesToScroll: 3,
		variableWidth: true
	});



});
