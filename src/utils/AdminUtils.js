exports.isNotAuthenticatedThenLogin = function (req, res, next) {
  if (req.user) {
    console.log("Req session is set.");
    return next();
  } else {
    console.log("Req session is not set.");
    return res.redirect('/login');
  }
};

