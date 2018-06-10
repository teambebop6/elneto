// require("../vendor/galleria/themes/classic/galleria.classic.css")

const app = require('./globals');

app.then(function(){
	console.log("Loaded galery.") 




    // =========this is for inside album gallery=========
    $('#albumSelf').justifiedGallery({
    	rowHeight : 280,
    	lastRow : 'nojustify',
    	maxRowHeight: 310,
    	randomize: true,
    	selector: 'figure, div:not(.spinner)',
    	margins : 20
    });

    $(window).scroll(function() {
    	if($(window).scrollTop() + $(window).height() == $(document).height()) {
    		for (var i = 0; i < 5; i++) {
    			$('#albumSelf').append('<a>' +
    				'<img src="http://path/to/image" />' + 
    				'</a>');
    		}
    		$('#albumSelf').justifiedGallery('norewind');
    	}
    });
    // =========this is for inside album gallery  END=========
});
