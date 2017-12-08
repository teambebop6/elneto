define(function (require) {
	require(['jquery', 'semantic'], function(){
		require(['galleria', 'galleria.classic'], function(Galleria){
			$.ajax({
				type: 'post',
				url: '/getGalery',
				data: {
					id: $('#galery_id').val()
				},
				success: function(result){
					if(result.status == 200){
						Galleria.run('.galleria', {
							dataSource: result.data,
							extend: function(options) {
									var gallery = this; // "this" is the gallery instance

									this.bind(Galleria.IMAGE, function(e) {
											var img = gallery.getData(gallery.getIndex());
											$('.image-info .image-title').html($(img).attr('title'));
											$('.image-info .image-description').html($(img).attr('description'));
									});
							}
						});
					}
				}
			});
		});
		
		$('.galery-details .more-info').click(function(){
			$('.galery-details .info-popup').toggle();
		});
	});
});
