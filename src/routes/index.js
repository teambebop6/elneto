var express = require('express');
var router = express.Router();
var db = require('../mongodb/db');
var request = require('request');
var path = require('path');

var { galeryCompare } = require('../utils/utils');
var env = process.env.NODE_ENV || 'development';

const AdminUtils = require('../utils/AdminUtils');

router.get('/hc', (req, res) => {
  res.send('ok');
});

router.all('/*', function (req, res, next) {
  req.app.locals.layout = 'main';
  req.app.locals.isDev = env === 'development';
  next(); // pass control to the next handler
});

// Home Page
router.get('/', function (req, res, next) {
  db.Galery.find({ isFavorite: true }).sort({ order: 'desc' }).exec(function (err, galeries) {
    if (err) {
      return next(err);
    }
    if (!galeries) { galeries = []; }

    var titlePics = {};
    var tags = ['teatro-cubano', 'teatro', 'danza', 'musica', 'yonny'];

    tags.forEach((tag) => {
      var tagKey = AdminUtils.camelCase(tag);
      titlePics[tagKey] = [];

      galeries.forEach((galery) => {
        if (galery.tags.indexOf(tag) > -1) {
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

router.get('/search-results', function (req, res, next) {
  var query = req.query.q || "";
  var host = req.get('host');
  var reqPath = 'http://' + path.join(host, '/api/search?q=' + query);

  request(reqPath, function (err, response, body) {
    if (!err && response.statusCode == 200) {

      var jsonBody = JSON.parse(body);

      if (!jsonBody || !jsonBody.results) {
        res.status(500);
        return next();
      }

      var results = jsonBody.results;
      var topResult;

      if (!Array.isArray(results) || results.length < 1) {
        results = [];
        topResult = [];
      } else {
        topResult = results[0];
        results.shift();
      }

      res.render('search-results', {
        title: 'Teatro cubano - Search results',
        topResult: topResult,
        results: results,
        scripts: 'teatro-cubano.bundle',
      })
    } else {
      next(err);
    }
  })
})

router.get('/teatro-cubano', function (req, res) {
  db.Galery.find({ tags: "teatro-cubano", isActive: true }).exec(function (err, galeries) {
    if (err) {
      throw err;
    }

    res.render('teatro-cubano', {
      title: 'Teatro Cubano',
      galeries: galeries
        .sort(galeryCompare)
        .map((g) => {
        return {
          _id: g._id,
          title: g.title,
          titlePicture: g.titlePicture
        }
      }),
      active: { teatro_cubano: true },
      scripts: 'teatro-cubano.bundle',
    });
  });
});

router.get('/danza', function (req, res) {
  db.Galery.find({ tags: "danza", isActive: true }).exec(function (err, galeries) {
    if (err) {
      throw err;
    }
    res.render('danza', {
      title: 'Danza',
      galeries: galeries
      .sort(galeryCompare)
      .map((g) => {
        return {
          _id: g._id,
          title: g.title,
          titlePicture: g.titlePicture
        }
      }),
      active: {
        danza: true
      },
      scripts: 'galery-cat.bundle',

    });
  });
});

router.get('/musica', function (req, res) {
  db.Galery.find({ tags: "musica", isActive: true }).exec(function (err, galeries) {
    if (err) {
      throw err;
    }

    // Add Ming Classics
    var mingClassics = [
      {
        _id: "ming-classics",
        title: "Ming Classics 2024 | Zürich und Vitznau",
        titlePicture: '/static/images/Classics-1973.jpg',
        dateOfPlay: new Date("2024/07/16"),
        link: "/ming-classics"
      }
    ];

    res.render('musica', {
      title: 'Musica',
      galeries: galeries
      .map((g) => {
        return {
          _id: g._id,
          title: g.title,
          titlePicture: g.titlePicture,
          link: "/galery/"+g._id,
          dateOfPlay: g.dateOfPlay,
        }
      })
      .concat(mingClassics)
      .sort(galeryCompare),
      active: {
        musik: true
      },
      scripts: 'galery-cat.bundle',
    });
  });
});

router.get('/teatro', function (req, res) {
  db.Galery.find({ tags: "teatro", isActive: true }).exec(function (err, galeries) {
    if (err) {
      throw err;
    }
    res.render('teatro', {
      title: 'Teatro',
      galeries: galeries
      .sort(galeryCompare)
      .map((g) => {
        return {
          _id: g._id,
          title: g.title,
          titlePicture: g.titlePicture
        }
      }),
      active: {
        theater: true
      },
      scripts: 'galery-cat.bundle'
    });
  });
});

router.get('/impressum', function (req, res) {
  res.render('impressum', {
    title: 'Impressum',
    active: {
      impressum: true
    },
    scripts: 'impressum.bundle',
  });
});


router.post('/getGalery', function (req, res, next) {
  db.Galery.findOne({ _id: req.body.id }, function (err, galery) {

    if (err) { return res.json(err); }
    if (!galery) { return res.json({ status: 400, message: "Galery not found." }); }

    // format galleria object
    var galleria = [];
    galery.images.forEach(function (image) {
      galleria.push({
        image: '/uploads/' + image.src,
        thumb: '/uploads/thumbs/' + image.src,
        description: image.description,
        title: image.title
      });
    });

    return res.json({ status: 200, data: galleria });
  });
});

// Get galery from hash link (ignore isActive)
router.get('/galery', function (req, res, next) {
  db.Galery.findOne({ _id: req.query.id }, function (err, galery) {
    if (err) { return next(err); }
    if (!galery) { return next({ status: 400, message: "Galery not found." }); }

    // Check if hash is valid
    if(AdminUtils.getHashDigest(galery.createdOn.toString()) !== req.query.hash) {
      return next({ status: 403, message: "Access denied." });
    }

    res.render('galery', {
      title: 'Galery',
      scripts: 'galery.bundle',
      galery: {
        _id: galery.id,
        title: galery.title,
        images: galery.images.map((image) => {
          return {
            src: image.src,
            title: image.title,
            comments: image.comments,
            link: image.link,
            width: image.width,
            height: image.height,
            linkThumb: image.linkThumb,
          }
        }),
        dateOfPlay: galery.dateOfPlay,
        location: galery.location,
        author: galery.author,
        director: galery.director,
        info1: galery.info1,
        info2: galery.info2,
      }
    });
  })
})

// Get galery
router.get('/galery/:id', function (req, res, next) {
  db.Galery.findOne({ _id: req.params.id, isActive: true }, function (err, galery) {
    if (err) { return next(err); }
    if (!galery) { return next({ status: 400, message: "Galery not found." }); }

    res.render('galery', {
      title: 'Galery',
      scripts: 'galery.bundle',
      galery: {
        _id: galery.id,
        title: galery.title,
        images: galery.images.map((image) => {
          return {
            src: image.src,
            title: image.title,
            comments: image.comments,
            link: image.link,
            width: image.width,
            height: image.height,
            linkThumb: image.linkThumb,
          }
        }),
        dateOfPlay: galery.dateOfPlay,
        location: galery.location,
        author: galery.author,
        director: galery.director,
        info1: galery.info1,
        info2: galery.info2,
      }
    });
  });
});

module.exports = router;