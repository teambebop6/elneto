var router = require('express').Router();
var db = require('../mongodb/db');
var env = process.env.NODE_ENV || 'development';
var constants = require('../utils/constants');
var adminUtils = require('../utils/AdminUtils');
const { galeryCompare } = require('../utils/utils');

const menuItems = (active) => constants.tags.filter((tag) => tag.type === 'ming-classics').map((tag) => {
  return {
    name: tag.name,
    url: "/ming-classics/" + tag.id,
    active: tag.id === active,
  }
});

const mapGaleries = (galeries) => galeries
.sort(galeryCompare)
.map((g) => {
  return {
    _id: g._id,
    title: g.title,
    titlePicture: g.titlePicture
  }
})


router.all('/*', function (req, res, next) {
  req.app.locals.layout = 'ming-classics';
  req.app.locals.isDev = env === 'development';
  next(); // pass control to the next handler
});

router.get('/', function (req, res, next) {
  db.Galery.find({ isFavorite: true }).exec(function (err, galeries) {
    if (err) {
      return (next(err))
    }

    if (!galeries) { galeries = []; }

    var titlePics = {};
    var tags = ['clarinet', 'orchestra', 'piano', 'strings', 'voice'];

    tags.forEach((tag) => {
      var tagKey = adminUtils.camelCase(tag);
      titlePics[tagKey] = [];

      galeries.forEach((galery) => {
        if (galery.tags.indexOf(tag) > -1) {
          titlePics[tagKey].push(galery.titlePicture);
        }
      });
    });

    res.render('ming-classics', {
      title: 'Ming Classics',
      scripts: 'ming-classics.bundle',
      titlePics: titlePics,
      menuItems: menuItems()
    });
  });
});

/// Clarinet
router.get('/clarinet', function (req, res) {
  db.Galery.find({  tags: { $all: ['ming-classics', 'clarinet'] }, isActive: true })
    .exec(function (err, galeries) {
    if (err) { throw err; }

    res.render('galery-cat', {
      title: 'Clarinet',
      galeries: mapGaleries(galeries),
      scripts: 'galery-cat.bundle',
      menuItems: menuItems("clarinet")
    });
  });
});

/// Orchestra
router.get('/orchestra', function (req, res) {
  db.Galery.find({  tags: { $all: ['ming-classics', 'orchestra'] }, isActive: true })
    .exec(function (err, galeries) {
    if (err) { throw err; }

    res.render('galery-cat', {
      title: 'Orchestra',
      galeries: mapGaleries(galeries),
      scripts: 'galery-cat.bundle',
      menuItems: menuItems("orchestra")
    });
  });
});

/// Piano
router.get('/piano', function (req, res) {
  db.Galery.find({  tags: { $all: ['ming-classics', 'piano'] }, isActive: true })
    .exec(function (err, galeries) {
    if (err) { throw err; }

    res.render('galery-cat', {
      title: 'Piano',
      galeries: mapGaleries(galeries),
      scripts: 'galery-cat.bundle',
      menuItems: menuItems("piano")
    });
  });
});

/// Voice
router.get('/voice', function (req, res) {
  db.Galery.find({  tags: { $all: ['ming-classics', 'voice'] }, isActive: true })
    .exec(function (err, galeries) {
    if (err) { throw err; }

    res.render('galery-cat', {
      title: 'Voice',
      galeries: mapGaleries(galeries),
      scripts: 'galery-cat.bundle',
      menuItems: menuItems("voice")
    });
  });
});

/// Strings
router.get('/strings', function (req, res) {
  db.Galery.find({  tags: { $all: ['ming-classics', 'strings'] }, isActive: true })
    .exec(function (err, galeries) {
    if (err) { throw err; }

    res.render('galery-cat', {
      title: 'Strings',
      galeries: mapGaleries(galeries),
      scripts: 'galery-cat.bundle',
      menuItems: menuItems("strings")
    });
  });
});

/// Ensemble
router.get('/ensemble', function (req, res) {
  db.Galery.find({  tags: { $all: ['ming-classics', 'ensemble'] }, isActive: true })
    .exec(function (err, galeries) {
    if (err) { throw err; }

    res.render('galery-cat', {
      title: 'Ensemble',
      galeries: mapGaleries(galeries),
      scripts: 'galery-cat.bundle',
      menuItems: menuItems("ensemble")
    });
  });
});


/// Honours etc
router.get('/honours', function (req, res) {
  db.Galery.find({  tags: { $all: ['ming-classics', 'honours'] }, isActive: true })
    .exec(function (err, galeries) {
    if (err) { throw err; }

    res.render('galery-cat', {
      title: 'Honours',
      galeries: mapGaleries(galeries),
      scripts: 'galery-cat.bundle',
      menuItems: menuItems("honours")
    });
  });
});


// Query
router.use("/query", require("./ming-classics-query"))


module.exports = router;