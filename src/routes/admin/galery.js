var express = require('express');
var router = express.Router();
var db = require('../../mongodb/db');
var path = require('path');
var fs = require('fs');
var handlebars = require('handlebars');

router.get('/getThumbTemplate', function(req,res){
	var src = req.query.src;
  fs.readFile('./src/views/partials/admin/galery-thumb-element.handlebars', 'utf8', function(err, content){
			var template = handlebars.compile(content);
			res.write(template({src: src}));
			res.end();
	});
});
router.get('/', function (req, res) {
  // Fetch trips
  db.Galery.find({title: {$exists: true}}).sort({dateOfPlay: 'asc'}).exec(function (err, galeries) {
    if (err) {
      console.log(err);
      return;
    }

    res.render('admin/list_galeries', {
      title: 'Manage Galeries',
      custom_js: 'admin/list-galeries.bundle',
      galeries: galeries,
      active: {list_galeries: true},
      body_scripts: 'list-galeries.bundle',
    });
  });

});


// modify galery
router.post('/modify', function(req,res){
	if(!req.body.galeryId && !req.body.action){
		res.json({success: false, message: "Missing data"});
		return;
	}

	db.Galery.findOne({_id: req.body.galeryId}, function(err, galery){
		if(err){ 
			res.json({success: false, message: err.message});
			return;	
		}
		if(!galery){
			res.json({success: false, message: "Galery does not exist"});
			return;	
		}


		if(req.body.action == "setActive"){
			galery.isActive = true;
		}else if(req.body.action == "setInactive"){
			galery.isActive = false;
		}else{
			res.json({success: false, message: "Nothing happened..."});
			return;
		}

		galery.save(function(err){
			if(err){ 
				res.json({success: false, message: err.message});
				return;	
			}
		
			res.json({success: true, message: "Sucessfully set galery state to active"}); return;
		});
	});

});

// GET, create new galery
router.get('/new', function(req, res){
	res.render('admin/new_galery', {
		title: 'Create new galery',	
		body_scripts: 'new-galery.bundle',
    css: ['new-galery'],
	});
});

// POST, create new galery
router.post('/new', function(req, res){

	db.Counter.findOne({_id: 'galery' }, function(err, counter){
		if(err){
			return res.json({success: false, message: err});
		}

		// Autoincrement of id
		if(!counter){
	
			counter = new db.Counter({
				_id : "galery",
				seq : 0
			});
		}
		counter.seq++;
		counter.save(function(err){
			
			// Create new galery
			var galery = new db.Galery({
				_id: counter.seq,
				title: req.body.title,
				description: req.body.description,
				dateOfPlay: new Date(req.body.date_of_play),
				createdOn: new Date(),
				location: req.body.location,
				author: req.body.author,
				director: req.body.director,
				tags: req.body.tags
			});

			console.log(galery);

			galery.save(function(err){
				if(err) { return res.json({success: false, message: err.message }); }
			
				res.json({success: true, galery_id: counter.seq});
			});

		});
	});
});

// GET, modify galery
router.get('/:id/modify', function(req, res){

	db.Galery.findOne({_id: req.params.id}, function(err, galery){
	
		if(err){ throw err; }	
		if(!galery){ return res.redirect('/admin'); }
			
		if(galery.titlePicture){
		
			// Find image that is title picture and assign isTitlePicture value
			galery.images.some(function(image){
				if(image.src == galery.titlePicture){
					image.isTitlePicture = true;
					return true;
				}
				return false;
			});
		}
		

		res.render('admin/modify_galery', {
			title: 'Manage galery',	
			galery: galery,
      body_scripts: 'modify-galery.bundle',
      tags: [],
		});
	});
});

// POST, modify galery
router.post('/:id/modify', function(req, res){
	db.Galery.findOne({_id: req.params.id}, function(err, galery){
		if(err){ res.json({success: false, message: err.message}); return; }	
		if(!galery){ res.json({success: false, message: "Galery does not exist!"}); return; }	

		var data = req.body;

		// SET TITLE PICTURE
		if(data.action == "setTitlePicture"){
			// Set title picture
			if(!data.titlePicture){ res.json({success: false, message: "Title picture not found. "}); return; }
			
			db.Galery.findOneAndUpdate({'images.src': data.titlePicture}, { '$set' : { 'titlePicture' : data.titlePicture }}, { upsert: true }, function(err, galery){
				if(err){ res.json({success: false, message: err.message}); return; }	
				if(!galery){ res.json({success: false, message: "Image does not exist in this galery!"}); return; }	
			});
			
			res.json({success: true}); return;
		}

		// UPDATE GALERY IMAGES 
		else if(data.action == "updateGaleryImages"){
			console.log("Updating galery images")	
			
			if(data.formData == null || data.formData.length <= 0){
				// formData is empty, do nothing
				res.json({success: true, message:"No data provided. Nothing happened."}); return;
			}
			
			// Parse object from json data
			var formData = JSON.parse(data.formData);
			
			console.log(formData)

			for(var key in formData){
				console.log("Key is: " + key);

				var src = key.substring(key.indexOf("-") + 1, key.length);
				console.log(src)
				var propertyName = key.substring(0, key.indexOf("-"));
				console.log(propertyName)
				
				galery.images.forEach(function(image){
					if(image.src == src){
						console.log('Found matching picture in galery')
						console.log(image)
						image[propertyName] = formData[key]
					}
				});
			}
			
			console.log("Galery:")
			console.log(galery);

			galery.save(function(err){
				if(err){ res.json({success: false, message: err.message}); return; }
			});
			
			res.json({success: true}); return;
		}
		
		// UPDATE GALERY INFO
		else if(data.action == "updateGaleryInfo"){
			console.log("Updating galery info")	
			
			if(data.formData == null || data.formData.length <= 0){
				// formData is empty, do nothing
				res.json({success: true, message:"No data provided. Nothing happened."}); return;
			}
			
			// Parse object from json data
			var formData = JSON.parse(data.formData);
			
			console.log(formData)

			// Iterate through data
			for(var key in formData){
				console.log("Key is: " + key);

				if(galery[key] !== 'undefined'){
					console.log("Updating to " + galery[key]);
					galery[key] = formData[key]					
				}		
			}
			
			galery['dateOfPlay'] = formData.date_of_play
		
			galery.save(function(err){
				if(err){ res.json({success: false, message: err.message}); return; }
			});
			
			res.json({success: true}); return;
		}
		
		res.json({success: false, message:"Nothing happened."}); return;
	});
});

// POST, delete galery picture
//

router.post('/:id/deletePicture', function(req, res){
	db.Galery.findOne({_id: req.params.id}, function(err, galery){
		if(err){ res.json({success:false, message: err.message}); return;}

		var errors = [];
		// Picture id
		var pictureId = req.body.id;

		galery.images = galery.images.filter(function(el){
			return el.src !== pictureId;
		});

		// Delete uploaded files
		fs.unlink(path.join(__dirname, '../../public/images/galery', pictureId), function(err){
			if(err){ errors.push(err.message); }
		});
		fs.unlink(path.join(__dirname, '../../public/images/galery/thumbs', pictureId), function(err){
			if(err){ errors.push(err.message); }
		});

		galery.save(function(err){
			if(err){ res.json({success:false, message: err.message}); return;}

			res.json({success: true, errors: errors });
		});

	});
});


// POST, set Favorite
//

router.post('/:id/setFavorite', function(req, res){
	db.Galery.findOne({_id: req.params.id}, function(err, galery){
		if(err){ res.json({success:false, message: err.message}); return;}
			 
		galery.isFavorite = true;
		galery.save(function(err){
			if(err){ res.json({success:false, message: err.message}); return;}

			res.json({success:true})
		});
	});
});
router.post('/:id/unsetFavorite', function(req, res){
	db.Galery.findOne({_id: req.params.id}, function(err, galery){
		if(err){ res.json({success:false, message: err.message}); return;}
		
		galery.isFavorite = false;
		galery.save(function(err){
			if(err){ res.json({success:false, message: err.message}); return;}

			res.json({success:true})
		});
	});
});





function deleteImage(image) {
	var taskPath = path.resolve(__dirname, '../../tasks/deleteImage.js');
	var childProcess = require('child_process').fork(taskPath);

	childProcess.on('message', function(message) {
		console.log(message);
	});
	childProcess.on('error', function(error) {
		console.error(error.stack)
	});
	childProcess.on('exit', function() {
		console.log('process exited');
	});
	
	if(image.src) {
		childProcess.send(image.src);
		}
}


// POST, delete galery
router.post('/delete', function(req, res){
	if(!req.body.id){
		res.json({success: false, message: "Missing galery id"});
		return;
	}

	db.Galery.findOne({_id: req.body.id}, function(err, galery){
		if(err){ res.json({success: false, message: err.message}); return; }
		if(!galery){ res.json({success: false, message: "Galery does not exist!"}); return; }

		galery.remove(function(err){
			if(err){ res.json({success: false, message: err.message}); return; }
			
			res.json({success: true, message: "Galery deleted successfully!"});
		});
		
		console.log(galery.images.length + " images to delete...");
		galery.images.forEach(function(image){
			// Call child process to delete image
			console.log("Deleting " + image.src);
			deleteImage(image);
		});

	});
});
module.exports = router;
