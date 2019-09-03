var express = require('express');
var router = express.Router();
var db = require('../mongodb/db');
var passport = require('passport');
var helpers = require('../lib/helpers');
var crypto = require('crypto');
var path = require('path');
var gm = require('gm');
var adminUtils = require('../utils/AdminUtils');
var fs = require('fs');
const stream = require('stream');

const MULTER = require('multer');
const multer = MULTER();

var sizeOf = require('image-size');

const RemoteUpload = require('../utils/RemoteUpload');

var env = process.env.NODE_ENV || 'development';
// Load config
var config = require('../config')(env);

if (config.USE_IMAGE_MAGICK) {
  gm = gm.subClass({ imageMagick: true });
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
passport.use(new LocalStrategy({ passReqToCallback: true },
  function (req, username, password, done) {
    db.User.findOne({ _id: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      // Compare hash of entered password to hashed password stored in database
      crypto.pbkdf2(password, user.salt, 10000, 512, 'sha512',
        function (err, hash) {
          if (err) {
            return done(err);
          }
          if (hash.toString('base64') === user.password) {
            return done(null, user);
          }

          return done(null, false, { message: 'Incorrect password.' });
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

router.all(['/admin/*', '/admin'], adminUtils.isNotAuthenticatedThenLogin,
  function (req, res, next) {

    req.app.locals.layout = 'admin';

    next(); // pass control to the next handler
  });

router.get('/admin', function (req, res) {
  req.app.locals.layout = 'admin';
  res.render('admin/home', {
    title: 'Admin home',
    user: req.user._id,
    active: { dashboard: true }
  });
});

// File Upload
upload.configure({
  uploadDir: config.UPLOAD_FOLDER,
  uploadUrl: '/uploads'
});

router.use('/admin/upload/:target?', upload.fileHandler());

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

  var { target } = req.params;

  console.log("File path is: " + filePath);

  if (target === 'yonny-foto') {

    db.YonnyFoto.findOne({ _id: req.fields.yonny_foto_id },
      function (err, yonnyFoto) {

        if (err || !yonnyFoto) {
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

        adminUtils.ensureDirExists(thumbFolder, function (err) {
          if (err) {
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

              sizeOf(filePath, function (err, dimensions) {

                var photo = {
                  link: fileInfo.name,
                  width: parseInt(dimensions.width),
                  height: parseInt(dimensions.height),
                };
                console.log(photo);
                // Add new picture to galery
                yonnyFoto.photos.push(photo);

                yonnyFoto.save();
                console.log(yonnyFoto.photos);
              });
            });
        })
      });

  } else if (target === 'cuadro') {

    db.Cuadro.findOne({ _id: req.fields.cuadro_id }, function (err, cuadro) {

      if (err || !cuadro) {
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

      adminUtils.ensureDirExists(thumbFolder, function (err) {
        if (err) {
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

            sizeOf(filePath, function (err, dimensions) {

              var photo = {
                link: fileInfo.name,
                width: parseInt(dimensions.width),
                height: parseInt(dimensions.height),
              };
              console.log(photo);
              // Add new picture to galery
              cuadro.photos.push(photo);

              cuadro.save();
              console.log(cuadro.photos);
            });
          });
      })
    });

  } else {

    db.Galery.findOne({ _id: req.fields.galery_id }, function (err, galery) {
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

      adminUtils.ensureDirExists(thumbFolder, function (err) {
        if (err) {
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

            sizeOf(filePath, function (err, dimensions) {

              var image = {
                src: fileInfo.name,
                width: parseInt(dimensions.width),
                height: parseInt(dimensions.height),
              };
              console.log(image);
              // Add new picture to galery
              galery.images.push(image);

              if (galery.images.length === 1) {
                galery.titlePicture = fileInfo.name;
              }
              galery.save();
              console.log(galery.images);
            });
          });
      })
    });

  }

});

router.post('/admin/upload2/:target?', multer.fields([{ name: 'files' }]),
  (req, res, next) => {

    const target = req.params.target || 'common';

    if (req.files && req.files.files) {

      const fileInfo = req.files.files[0];

      const buffer = fileInfo.buffer;
      const dimensions = sizeOf(buffer);

      const originalName = fileInfo.originalname;
      const mimeType = fileInfo.mimetype;

      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);

      new RemoteUpload(req.config)
        .upload({
          fileName: target + '/' + originalName,
          mimeType,
          stream: bufferStream
        })
        .then((urls) => {

          Object.assign(urls, {
            id: new Buffer(urls.url).toString('base64').replace(/=/g, ""),
          });

          if (target === 'cuadro') {

            db.Cuadro.findOne({ _id: req.body.cuadro_id }, (err, cuadro) => {
              if (err || !cuadro) {
                res.status(500).json({
                  error: 'Error! Please retry!'
                })
              } else {
                const photo = {
                  id: urls.id,
                  link: urls.url,
                  linkThumb: urls.thumbUrl,
                  width: parseInt(dimensions.width),
                  height: parseInt(dimensions.height),
                };
                console.log(photo);
                // Add new picture to galery
                cuadro.photos.push(photo);
                cuadro.save().then(() => {
                  res.json(urls);
                });
              }
            })
          } if (target === 'yonny-foto') {

            db.YonnyFoto.findOne({ _id: req.body.yonny_foto_id }, (err, yonnyFoto) => {
              if (err || !yonnyFoto) {
                res.status(500).json({
                  error: 'Error! Please retry!'
                })
              } else {
                const photo = {
                  id: urls.id,
                  link: urls.url,
                  linkThumb: urls.thumbUrl,
                  width: parseInt(dimensions.width),
                  height: parseInt(dimensions.height),
                };
                console.log(photo);
                // Add new picture to galery
                yonnyFoto.photos.push(photo);
                yonnyFoto.save().then(() => {
                  res.json(urls);
                });
              }
            })

          } else {

            db.Galery.findOne({ _id: req.body.galery_id }, (err, galery) => {
              if (err || !galery) {
                res.status(500).json({
                  error: 'Error! Please retry!'
                })
              } else {
                const photo = {
                  id: urls.id,
                  link: urls.url,
                  linkThumb: urls.thumbUrl,
                  width: parseInt(dimensions.width),
                  height: parseInt(dimensions.height),
                };
                console.log(photo);
                // Add new picture to galery
                galery.images.push(photo);
                galery.save().then(() => {
                  res.json(urls);
                });
              }
            })
          }
        })
        .catch((error) => {
          res.status(500).json(error)
        });

    } else {
      res.json({})
    }
  });

module.exports = router;
