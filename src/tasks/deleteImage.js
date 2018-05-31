var gulp = require('gulp');
var path = require('path');
var fs = require('fs');

function deleteImage(image) {
	
	process.send('Image deletion started');
	process.send('Directory is ' + __dirname);
	// Delete uploaded files
	fs.unlink(path.join(__dirname, '../public/images/galery', image), function(err){
		if(err) { process.send(err); }
		else{
			process.send('Image removed from galery folder');
		}

		fs.unlink(path.join(__dirname, '../public/images/galery/thumbs', image), function(err){
			if(err) { process.send(err); }
			else{
				process.send('Image removed from thumbs folder');
			}

			process.send("Process finished.");
			process.exit();
		});
	});
}

process.on('message', function (images) {
      	console.log('Image processing started...');
      	
	var stream = deleteImage(images);
});

module.exports = {};
