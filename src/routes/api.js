var express = require('express');
var router = express.Router();

var User = require('../mongodb/user_model');

router.post('/user/create', function(req, res, next){
  console.log("received request");
  console.log(req.body);

  var usr = new User({
    _id: req.body.username,
    password:req.body.password,
  });

  usr.save(function(err){
    if(err){ res.json(err)}
    else{
      console.log("Added user: " + usr._id);

      res.status(200).json({message: "ok."})
    }
  });
});

module.exports = router;
