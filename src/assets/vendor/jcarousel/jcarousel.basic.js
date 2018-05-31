
// jCarousel
$('.jcarousel').jcarousel({
	wrap: 'circular',
	animation: {
		duration: 0,
	},
	scroll: 1,
	visible: 1,
	auto: 1
})
.jcarouselAutoscroll({
	target: '+=1',
	interval: '8000',
	autostart: true
});

// make fadeIn effect
$('.jcarousel').on('jcarousel:animate', function (event, carousel) {
	$(carousel._element.context).find('li').hide().fadeIn(1000);
});

// Control "previous"
$('.jcarousel-control-prev')
		.on('jcarouselcontrol:active', function() {
				$(this).removeClass('inactive');
		})
		.on('jcarouselcontrol:inactive', function() {
				$(this).addClass('inactive');
		})
		.jcarouselControl({
				target: '-=1'
		});

// Control "next"
$('.jcarousel-control-next')
		.on('jcarouselcontrol:active', function() {
				$(this).removeClass('inactive');
		})
		.on('jcarouselcontrol:inactive', function() {
				$(this).addClass('inactive');
		})
		.jcarouselControl({
				target: '+=1'
		});

// Pagination
$('.jcarousel-pagination')
		.on('jcarouselpagination:active', 'a', function() {
				$(this).addClass('active');
		})
		.on('jcarouselpagination:inactive', 'a', function() {
				$(this).removeClass('active');
		})
		.jcarouselPagination();
