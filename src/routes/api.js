var express = require('express');
var router = express.Router();

var User = require('../mongodb/user_model');
var SearchEntries = require('../mongodb/searchEntry_model');

if(process.env.NODE_ENV === "development"){
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
}

router.get('/search', function(req, res, next){
  const query = req.query.q;

  if(!query){
    // return 20 collection
    return SearchEntries.find().sort({"work": 1}).limit(20).exec(function(err, results){
      if(err){ res.json(err); }
      else{
        res.json({
          results: results
        })
      }
    });
  } else {
    SearchEntries.find({ $text: { $search: query } }, { score: { $meta: "textScore" } }).sort({
      score:{ $meta: "textScore" }
    }).exec(function(err, results){
      if(err){
        return res.json(err);
      } else {
        res.json({
          results: results,
        });
      }
    });
  }
});

module.exports = router;
