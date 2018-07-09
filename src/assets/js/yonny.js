require('../less/yonny.less');
var app = require("./globals");

app.then(function(){


		$('.yonny_poem_wrapper .poemList li').click(function(){
			alert('asdfadsf');
			$('.imageWrapper').css('margin-left','100vw');
			setTimeout(function() {
				$('.yonny_poem_wrapper').css('margin-left','100vw');
			}, 300);

		})

});
