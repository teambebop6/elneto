var express = require('express');
var router = express.Router();
var db = require('../mongodb/db');
var passport = require('passport');
var helpers = require('../lib/helpers')

router.all('/*', function (req, res, next) {
	req.app.locals.layout = 'main';
	next(); // pass control to the next handler
    });


router.get('/', function(req, res){
	db.Galery.find({isFavorite: true}).sort({dateOfPlay: 'desc'}).exec(function(err, galeries){
		res.render('home', {
      title: 'Home',
      scripts: 'home.bundle',
      favoriteGaleries: galeries
    });
  });	
});



router.get('/teatro-cubano', function(req, res){
  db.Galery.find({tags: "teatro-cubano", isActive: true}).sort({dateOfPlay: 'desc'}).exec(function(err, galeries){
    if(err){
      throw err;
    }

    console.log(galeries);

    res.render('galery-cat', {
      title: 'Teatro Cubano',
      galeries: galeries,
      active: { teatro_cubano: true },
      scripts: 'galery-cat.bundle',
    });
  });
});

router.get('/danza', function(req, res){
  db.Galery.find({tags: "danza", isActive: true}).sort({dateOfPlay: 'desc'}).exec(function(err, galeries){
    if(err){
      throw err;
    }
    res.render('galery-cat', {
      title: 'Danza',
      galeries: galeries,
      active: {
        danza: true
      },
      body_scripts: function(){
        return 'galery-cat.body';
      }

    });
  });
});

router.get('/musica', function(req, res){
  db.Galery.find({tags: "musik", isActive: true}).sort({dateOfPlay: 'desc'}).exec(function(err, galeries){
    if(err){
      throw err;
    }
    res.render('galery-cat', {
      title: 'Musik',
      galeries: galeries,
      active: {
        musik: true
      },
      body_scripts: function(){
        return 'galery-cat.body';
      }

    });
  });
});

router.get('/teatro', function(req, res){
  db.Galery.find({tags: "theater", isActive: true}).sort({dateOfPlay: 'desc'}).exec(function(err, galeries){
    if(err){
      throw err;
    }
    res.render('galery-cat', {
      title: 'Theater',
      galeries: galeries,
      active: {
        theater: true
      },
      body_scripts: function(){
        return 'galery-cat.body';
      }

    });
  });
});



router.get('/impressum', function(req, res){
  res.render('impressum', {
    title: 'Impressum',
    active: {
      impressum: true
    }
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

    console.log(galery);

    res.render('galery', {
      title: 'Galery',
      scripts: 'galery.bundle',
      galery: galery
    });
  });
});
module.exports = router;
