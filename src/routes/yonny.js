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

  db.Cuadro.find({ visible: true }).sort({ order: 'desc' }).exec(
    (err, cuadros) => {

      if (err) {
        logger.error("Find cuadros failed", err);
        cuadros = [];
      }

      const cuadroObjects = cuadros.filter((c) => {
        return c.photos && c.photos.length > 0
      }).map(c => db.Cuadro.toDTO(c));

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

/**
 *
 * @param res
 * @param poemGroup [{poemCollection.title, poems}]
 * @param poemCollections [poemCollection]
 */
const renderPoems = (res, poemGroups, poemCollections) => {
  res.render('yonny/poemas', {
    title: 'Yonny',
    active: {
      poemas: true
    },
    poems: JSON.stringify(poemGroups),
    poemCollections,
    scripts: 'poemas.bundle',
  });
}

router.get('/poemas', function (req, res) {

  const cond = { visible: true };

  // find visible collections
  db.PoemCollection.find(cond).sort({ lastModifiedDate: -1 }).exec((error1, clts) => {
    if (error1) {
      logger.error("Find poem collections failed", error1);
      renderPoems(res, [], [])
      return
    }
    const poemCollections = clts.map(c => c.title)
    db.Poem.aggregate([
      {
        $match: {
          poemCollection: {
            $in: poemCollections
          },
          visible: true
        }
      },
      {
        $group: {
          _id: 	"$poemCollection",
          poems: {
            $push: "$$ROOT"
          }
        }
      }
    ]).exec((error2, poemGroups) => {
      if (error2) {
        logger.error("Find poem failed", error1);
        renderPoems(res, [], [])
        return
      }
      renderPoems(res, poemGroups, poemCollections)
    })
  })
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

  db.YonnyFoto.find({ visible: true }).sort({ order: 'desc' }).exec(
    (err, yonnyFotos) => {

      if (err) {
        logger.error("Find cuadros failed", err);
        yonnyFotos = [];
      }

      const yonnyFotoObjects = yonnyFotos.filter((c) => {
        return c.photos && c.photos.length > 0
      }).map(c => db.YonnyFoto.toDTO(c));

      res.render('yonny/en_fotos', {
        title: 'Yonny',
        active: {
          enFotos: true
        },
        yonnyFotos: yonnyFotoObjects,
        scripts: 'yonny.bundle',
      });

    });

});
