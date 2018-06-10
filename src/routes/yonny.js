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
  });
});
router.get('/cuadros', function(req, res){
  res.render('yonny/cuadros', {
    title: 'Yonny',
    active: {
      cuadros: true
    },
  });
});
router.get('/poemas', function(req, res){
  res.render('yonny/poemas', {
    title: 'Yonny',
    active: {
      poemas: true
    },
  });
});
router.get('/en-fotos', function(req, res){
  res.render('yonny/en_fotos', {
    title: 'Yonny',
    active: {
      enFotos: true
    },
  });
});


