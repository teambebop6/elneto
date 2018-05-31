// Create thumbnails from images in input directory to output directory
// example: node createThumbs.js /path/to/input /path/to/output

var gm = require('gm').subClass({imageMagick: true});
var path = require('path'); 
var fs = require('fs');

var inputDir = process.argv[2];
var outputDir = process.argv[3];

if(!inputDir || !outputDir){ 
	console.log("please give an input and an output directory");
	process.exit(-1);
}

// Read given directory
var files = fs.readdirSync(inputDir);

var extensions = [ '.jpg', '.png', '.gif'];

// Select image files
files = files.filter(function(file){ 
	return extensions.indexOf(path.extname(file).toLowerCase()) !==-1 
});

files.forEach(function(file){
	gm(path.join(inputDir, file))
		.resize('240','240','^') // ^ designates minimum height
		.gravity('Center')
		.crop('240', '160')
		.write(path.join(outputDir, file), function(err){
			if(err) { console.log(err); return; }
			console.log("Thumbnail successfully generated!");
		});
});
