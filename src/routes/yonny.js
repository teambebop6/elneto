var express = require('express');
var router = express.Router();
const logger = require('../lib/logger');

let db = require('../mongodb/db');

module.exports = router;

// Set hbs layout
router.get('/*', function (req, res, next) {
  req.app.locals.layout = 'yonny';
  next();
});

router.get('/', function (req, res) {

  db.Cuadro.find({visible: true}).sort({ creationDate: 'asc' }).exec((err, cuadros) => {

    if (err) {
      logger.error("Find cuadros failed", err);
      cuadros = [];
    }

    const cuadroObjects = cuadros.map( c => db.Cuadro.toDTO(c));

    res.render('yonny/cuadros', {
      title: 'Yonny',
      active: {
        cuadros: true
      },
      cuadros: cuadroObjects,
      scripts: 'yonny.bundle',
    });

  });

});

router.get('/serie', function (req, res, next) {
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

router.get('/poemas', function (req, res) {

  const cond = { visible: true };

  db.Poem.find(cond).limit(8).sort({ lastModifiedDate: -1 }).exec(
    (error, poems) => {
      const data = poems.map(p => db.Poem.toDTO(p));

      res.render('yonny/poemas', {
        title: 'Yonny',
        active: {
          poemas: true
        },
        poems: data,
        scripts: 'poemas.bundle',
      });

    });

});

router.get('/poemas-detail', function (req, res) {
  res.render('yonny/poemas-detail', {
    title: 'Yonny',
    active: {
      poemas: true
    },
    scripts: 'yonny.bundle',
  });
});

router.get('/en-fotos', function (req, res) {
  res.render('yonny/en_fotos', {
    title: 'Yonny',
    scripts: 'yonny.bundle',
    active: {
      enFotos: true
    },
  });
});
