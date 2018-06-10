var fs = require('fs');


exports.isNotAuthenticatedThenLogin = function (req, res, next) {
  if (req.user) {
    console.log("Req session is set.");
    return next();
  } else {
    console.log("Req session is not set.");
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
