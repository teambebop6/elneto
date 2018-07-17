var express = require('express');
var router = express.Router();

module.exports = router;

// Set hbs layout
router.get('/*', function(req, res, next){
  req.app.locals.layout = 'yonny';
  next();
});


router.get('/', function(req, res){
  res.render('yonny/home', {
    title: 'Yonny',
    active: {
      yonny: true
    },
    scripts: 'yonny.bundle',
  });
});

router.get('/cuadros', function(req, res){
  res.render('yonny/cuadros', {
    title: 'Yonny',
    active: {
      cuadros: true
    },
    scripts: 'yonny.bundle',
  });
});

router.get('/serie', function(req, res, next){
  res.render('yonny/serie', {
    title: 'Yonny serie',
    active: {
      cuadros: true
    },
    scripts: 'yonny.bundle',
    serie: {
      // put some test data here
      title: "Series title",
      year: "1994",
      style: "oil",
      images: [
        {
          title: "cool picture title",
          description: "test description of picture",
          path: "https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=350",
        },
        {
          title: "cool picture title",
          description: "test description of picture",
          path: "https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=350",
        },
        {
          title: "cool picture title",
          description: "test description of picture",
          path: "https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=350",
        },
        {
          title: "cool picture title",
          description: "test description of picture",
          path: "https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=350",
        },
      ]
    }
  });
});


router.get('/poemas', function(req, res){
  res.render('yonny/poemas', {
    title: 'Yonny',
    active: {
      poemas: true
    },
    scripts: 'yonny.bundle',
  });
});

router.get('/en-fotos', function(req, res){
  res.render('yonny/en_fotos', {
    title: 'Yonny',
    scripts: 'yonny.bundle',
    active: {
      enFotos: true
    },
  });
});
