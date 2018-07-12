var fs = require('fs');

exports.sort_by = function(field, reverse, primer){

  var key = primer ? 
    function(x) {return primer(x[field])} : 
    function(x) {return x[field]};

  reverse = !reverse ? 1 : -1;

  return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
  } 
}

exports.isNotAuthenticatedThenLogin = function (req, res, next) {
  if (req.user) { return next(); } 
  else {
    return res.redirect('/login');
  }
};

exports.ensureDirExists = function(path, mask, cb) {
  if (typeof mask === 'function') {
    cb = mask;
    mask = 0x1ff;
  }
  return fs.mkdir(path, mask, function(err) {
    if (err) {
      if (err.code === 'EEXIST') {
        return cb(null);
      } else {
        return cb(err);
      }
    } else {
      return cb(null);
    }
  });
};
