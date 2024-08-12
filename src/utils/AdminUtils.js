var fs = require('fs');
var crypto = require('crypto');

exports.camelCase = function(string) {
    return string.replace( /-([a-z])/ig, function( all, letter ) {
        return letter.toUpperCase();
    });
}
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

exports.getOrigin = function(req) {
  if(req.hostname === "localhost"){
    return `${req.protocol}://${req.hostname}:${req.socket.localPort}`
  }else{
    return `https://${process.env.ELNETO_ENV === "dev" ? "dev." : "www."}elneto.com`
  }
}

exports.getHashDigest = function (string) {
  return crypto.createHash('md5').update(string).digest('base64');
}
