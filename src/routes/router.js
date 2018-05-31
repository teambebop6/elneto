var express = require('express');
var router = express.Router();
var passport = require('passport');
var db = require('../mongodb/db');
var path = require('path');
var env = process.env.NODE_ENV || "development";
var config = require('../config')(env);

// Static folders
// router.use('/assets', express.static((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') ? 'assets' : 'public/dist'));
router.use('/assets', express.static('public/dist'));
router.use('/static', express.static('public'));
router.use('/uploads', express.static(config.UPLOAD_FOLDER));

// Load routes
router.use('/', require('./api'));
router.use('/', require('./index'));
router.use('/', require('./admin'));

router.use('/admin/galery', require('./admin/galery'));

// Redirect if last char of url is '/'
router.use(function (req, res, next) {
  if (req.path.substr(-1) == '/' && req.path.length > 1) {
    var query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});

// catch 404 and forward to error handler
router.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (router.get('env') === 'development') {
  router.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
router.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = router;
