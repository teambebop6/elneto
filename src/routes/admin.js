var express = require('express');
var router = express.Router();
var db = require('../mongodb/db');
var passport = require('passport');
var helpers = require('../lib/helpers')
var crypto = require('crypto');
var path = require('path');
var gm = require('gm');
var adminUtils = require('../utils/AdminUtils');


var sizeOf = require('image-size');




var env = process.env.NODE_ENV || 'development';
// Load config
var config = require('../config')(env);

if (config.USE_IMAGE_MAGICK) {
  gm = gm.subClass({imageMagick: true});
}



// File upload middleware
var upload = require('jquery-file-upload-middleware');

// Passport login middleware
passport.serializeUser(function (user, done) {
  return done(null, user);
});

passport.deserializeUser(function (user, done) {
  return done(null, user);
});

var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy({passReqToCallback: true},
  function (req, username, password, done) {
    db.User.findOne({_id: username}, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {message: 'Incorrect username.'});
      }

      // Compare hash of entered password to hashed password stored in database
      crypto.pbkdf2(password, user.salt, 10000, 512, 'sha512', function (err, hash) {
        if (err) {
          return done(err);
        }
        if (hash == user.password) {
          return done(null, user);
        }

        return done(null, false, {message: 'Incorrect password.'});
      });
    });
  }
));

router.get('/login', function (req, res) {
  req.app.locals.layout = 'admin';
  res.render('admin/login', {
    title: 'Elneto Login',
    flash: req.flash()
  });
});

router.get('/logout', function (req, res) {

  req.logout();

  res.render('admin/logout', {
    title: 'Elneto - Successfully logged out',
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/admin',
  failureRedirect: '/login',
  failureFlash: true
}));

router.all(['/admin/*', '/admin'], adminUtils.isNotAuthenticatedThenLogin, function (req, res, next) {

  req.app.locals.layout = 'admin';

  next(); // pass control to the next handler
});

router.get('/admin', function (req, res) {
  req.app.locals.layout = 'admin';
  res.render('admin/home', {
    title: 'Admin home',
    user: req.user._id,
    active: {dashboard: true}
  });
});


// File Upload
upload.configure({
  uploadDir: config.UPLOAD_FOLDER,
  //uploadDir: __dirname + '/../public/uploads',
  uploadUrl: '/uploads'
});

router.use('/admin/upload', upload.fileHandler());

upload.on('begin', function (fileInfo) {
  // Create crypto filename
  crypto.pseudoRandomBytes(16, function (err, raw) {
    if (err) {
      return console.log(err);
    }

    fileInfo.name = raw.toString('hex') + path.extname(fileInfo.originalName);
  });
});

function sleep(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}

upload.on('end', function (fileInfo, req, res) {
  var filePath = path.join(config.UPLOAD_FOLDER, fileInfo.name);
  console.log("File path is: "+ filePath);
  
  db.Galery.findOne({_id: req.fields.galery_id}, function (err, galery) {
    if (err || !galery) {
      // Delete uploaded files
      fs.unlink(filePath, function (err) {
        if (err) {
          console.log(err);
          return;
        }
      });

      if (err) {
        console.log(err);
        return;
      }
      else {
        console.log("There was an error uploading the file!");
      }
    }


    var thumbFolder = path.join(config.UPLOAD_FOLDER, "thumbs");
    
    adminUtils.ensureDirExists(thumbFolder, function(err){
      if(err){
        console.log(err);
        return;
      }

      // Create thumbs
      var thumbWidth = 500; // px
      var thumbHeight = 500; // px

      gm(filePath)
        .resize(thumbWidth, thumbHeight, '^') // ^ designates minimum height
        .gravity('Center')
        //.crop('240', '160')
        .write(path.join(thumbFolder, fileInfo.name), function (err) {
          if (err) {
            console.log(err);
            return;
          }
          console.log("Thumbnail successfully generated!");

          sizeOf(filePath, function(err, dimensions){

            var image = {
              src: fileInfo.name,
              width: parseInt(dimensions.width),
              height: parseInt(dimensions.height),
            }
            console.log(image);
            // Add new picture to galery
            galery.images.push(image);

            if (galery.images.length == 1) {
              galery.titlePicture = fileInfo.name;
            }

            galery.save();


            console.log(galery.images);
          });
        });
    })
  });
});

module.exports = router;
