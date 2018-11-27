var express = require('express');
var router = express.Router();
var db = require('../mongodb/db');
var passport = require('passport');
var helpers = require('../lib/helpers')
var request = require('request');
var path = require('path');

var utils = require('../utils/AdminUtils');
var env = process.env.NODE_ENV || 'development';

router.all('/*', function (req, res, next) {
  req.app.locals.layout = 'main';
  req.app.locals.isDev = env === 'development';
  next(); // pass control to the next handler
});

router.get('/', function(req, res, next){
  db.Galery.find({isFavorite: true}).sort({dateOfPlay: 'desc'}).exec(function(err, galeries){
    if(err){ return next(err); }
    if(!galeries){ galeries = []; }

    var titlePics = {}
    var tags = ['teatro-cubano', 'teatro', 'danza', 'musica', 'yonny'];

    tags.forEach(function(tag){
      var tagKey = utils.camelCase(tag);
      titlePics[tagKey] = [];

      galeries.forEach(function(galery){
        if(galery.tags.indexOf(tag) > -1){
          titlePics[tagKey].push(galery.titlePicture);
        }
      });
    });

    res.render('home', {
      title: 'Home',
      scripts: 'home.bundle',
      titlePics: titlePics,
    });
  });	
});

router.get('/search-results', function(req, res, next){
  var query = req.query.q || "";
  var host = req.get('host');
  var reqPath = 'http://' + path.join(host, '/api/search?q='+query);

  request(reqPath, function (err, response, body) {
    if (!err && response.statusCode == 200) {

      var jsonBody = JSON.parse(body);

      if(!jsonBody || !jsonBody.results){
        res.status(500);
        return next();
      }

      var results = jsonBody.results;
      var topResult;

      if(!Array.isArray(results) || results.length < 1){
        results = [];
        topResult = [];
      }else{
        topResult = results[0];
        results.shift();
      }

      res.render('search-results', {
        title: 'Teatro cubano - Search results',
        topResult: topResult,
        results: results,
        scripts: 'teatro-cubano.bundle',
      })
    }else{
      next(err);
    }
  })
})

router.get('/teatro-cubano', function(req, res){
  db.Galery.find({tags: "teatro-cubano", isActive: true}).sort({dateOfPlay: 'asc'}).exec(function(err, galeries){
    if(err){
      throw err;
    }

    res.render('teatro-cubano', {
      title: 'Teatro Cubano',
      galeries: galeries,
      active: { teatro_cubano: true },
      scripts: 'teatro-cubano.bundle',
    });
  });
});

router.get('/danza', function(req, res){
  db.Galery.find({tags: "danza", isActive: true}).sort({dateOfPlay: 'asc'}).exec(function(err, galeries){
    if(err){
      throw err;
    }
    res.render('danza', {
      title: 'Danza',
      galeries: galeries,
      active: {
        danza: true
      },
      scripts: 'galery-cat.bundle',

    });
  });
});

router.get('/musica', function(req, res){
  db.Galery.find({tags: "musica", isActive: true}).sort({dateOfPlay: 'asc'}).exec(function(err, galeries){
    if(err){
      throw err;
    }
    res.render('musica', {
      title: 'Musica',
      galeries: galeries,
      active: {
        musik: true
      },
      scripts: 'galery-cat.bundle',

    });
  });
});

router.get('/teatro', function(req, res){
  db.Galery.find({tags: "teatro", isActive: true}).sort({dateOfPlay: 'asc'}).exec(function(err, galeries){
    if(err){
      throw err;
    }
    res.render('teatro', {
      title: 'Teatro',
      galeries: galeries,
      active: {
        theater: true
      },
      scripts: 'galery-cat.bundle',

    });
  });
});

router.get('/impressum', function(req, res){
  res.render('impressum', {
    title: 'Impressum',
    active: {
      impressum: true
      },
      scripts: 'impressum.bundle',
  });
});


router.post('/getGalery', function(req, res, next){
  db.Galery.findOne({_id: req.body.id}, function(err, galery){

    if(err){ return res.json(err); }
    if(!galery){ return res.json({status: 400, message: "Galery not found."}); }

    // format galleria object
    var galleria = [];
    galery.images.forEach(function(image){
      galleria.push({
        image : '/static/images/galery/' + image.src,
        thumb : '/static/images/galery/thumbs/' + image.src,
        description : image.description,
        title : image.title
      });
    });

    return res.json({status: 200, data: galleria});
  });
});

router.get('/galery/:id', function(req, res){
  db.Galery.findOne({_id: req.params.id}, function(err, galery){
    if(err){ return next(err); }
    if(!galery){ return next({status: 400, message: "Galery not found."}); }

    // Sort them imageso
    galery.images.sort(utils.sort_by("sort"));

    res.render('galery', {
      title: 'Galery',
      scripts: 'galery.bundle',
      galery: galery
    });
  });
});



module.exports = router;
