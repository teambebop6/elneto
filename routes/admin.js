var express = require('express');
var router = express.Router();
var db = require('../mongodb/db');
var passport = require('passport');
var helpers = require('../lib/helpers')
var crypto = require('crypto');
var path = require('path');
var gm = require('gm');

if(process.env.USE_IMAGE_MAGICK){
	gm = gm.subClass({imageMagick: true});
}

// File upload middleware
var upload = require('jquery-file-upload-middleware');

// Passport login middleware
passport.serializeUser(function(user, done) {
  return done(null, user);
});

passport.deserializeUser(function(user, done) {
  return done(null, user);
});

var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy({ passReqToCallback: true },
	function(req, username, password, done) {
		db.User.findOne({ _id: username }, function (err, user) {
			if (err) { return done(err); }
			if (!user) {
				return done(null, false, { message: 'Incorrect username.' });
			}
		
			// Compare hash of entered password to hashed password stored in database	
			crypto.pbkdf2(password, user.salt, 10000, 512, function(err, hash) {
				if(err) { return done(err); }
				if(hash == user.password) { return done(null, user); }

				return done(null, false, { message: 'Incorrect password.' });
			});
		});
	}
));

router.get('/login', function(req, res){
	req.app.locals.layout = 'admin';
	res.render('admin/login', {
		title: 'Elneto Login',
		flash: req.flash()
	});
});

router.post('/login', passport.authenticate('local', { 
			successRedirect: '/admin',
			failureRedirect: '/login',
			failureFlash: true }));

router.all('/admin/*', function (req, res, next) {
	// Check if user is logged in
	if(!req.user) {
		res.redirect('/login'); 
		return;
	}

	req.app.locals.layout = 'admin';
	
	next(); // pass control to the next handler
});

router.get('/admin', function(req, res){
	// Check if user is logged in
	if(!req.user) {
		res.redirect('/login'); 
		return;
	}
	
	req.app.locals.layout = 'admin';

	res.render('admin/home', {
		title: 'Admin home',
		user: req.user._id,
		active: { dashboard: true }
	});
});

router.get('/admin/list-galeries', function(req,res){
	// Fetch trips
	db.Galery.find({title: {$exists: true}}).sort({dateOfPlay: 'asc'}).exec(function(err, galeries){
		if(err){
			console.log(err);
			return;
		}
	
		res.render('admin/list_galeries', {
			title: 'Manage Galeries',
			custom_js: 'admin/list-galeries.bundle',
			galeries: galeries,
			active: {list_galeries : true}
		});	
	});

});

// Load galery subroute
router.use('/admin/galery', require('./admin/galery'));

// File Upload
upload.configure({
	uploadDir: __dirname + '/../public/uploads',
	uploadUrl: '/uploads'
	});

router.use('/admin/upload', upload.fileHandler());

upload.on('begin', function(fileInfo){
	// Create crypto filename
	crypto.pseudoRandomBytes(16, function (err, raw) {
		if(err) { return console.log(err); }
		
		fileInfo.name = raw.toString('hex') + path.extname(fileInfo.originalName);
	});
});

function sleep (time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

upload.on('end', function(fileInfo, req, res){

	// Move to proper directory
	upload.fileManager().move(fileInfo.name, '../images/galery', function(err, result){
		if(err){ console.log(err); return; }

		db.Galery.findOne({_id: req.fields.galery_id}, function(err, galery){	
			if(err || !galery) {
				// Delete uploaded files
				fs.unlink(path.join(__dirname, '../images/galery', fileInfo.name), function(err){
					if(err) { return console.log(err); }
				});
			
				if(err){ console.log(err); return; }
				else{
					console.log("There was an error uploading the file!");
				}
			}
			
			// Create thumbs
			//
			
			gm(path.join(__dirname, '../public/images/galery', fileInfo.name))
				.resize('240','240','^') // ^ designates minimum height
				.gravity('Center')
				.crop('240', '160')
				.write(path.join(__dirname, '../public/images/galery/thumbs', fileInfo.name), function(err){
					if(err) { console.log(err); return; }
					console.log("Thumbnail successfully generated!");
					
						
					// Add new picture to galery
					galery.images.push({
						src: fileInfo.name
					});

					if(galery.images.length == 1){
						galery.titlePicture = fileInfo.name;
					}
					galery.save();
				});
		});
	});
});

module.exports = router;
