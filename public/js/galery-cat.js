define(function (require) {
	require(['jquery', 'semantic'], function(){
			
		// Initial height
		var initializeThumbs = function(){
			$('.galery-title .info').each(function(el){
				parent_height = $(this).parent().height();
				title_height = $(this).find('.title').height();

				//$(this).css('top', parent_height-title_height + 'px');
				$(this).css('top', parent_height + 'px');
		
				$(this).find('.line').each(function(line){
					$(line).css('min-width', $(this).width()+'px');
				});

				$(this).click(function(e){
					this.location.href = "/galery/" + $(this).data('id');
				});
			});
		};

		initializeThumbs();
		
		// Mouseover
		$('.galery-title').mouseenter(function(){
			$(this).find('.info').css('top', '0px');
		});
		// Mouseout
		$('.galery-title').mouseleave(function(){
			initializeThumbs();
		});


		// Search db
		$('.searchdb_form').submit(function(e){
			e.preventDefault();

		});
		
	});
});
