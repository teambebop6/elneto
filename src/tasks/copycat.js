// Florian Rudin, June 17, 2018

var db = require('../mongodb/connect');

var env = "development";
var config = require('../config')(env);

var mongoose = require('mongoose');

db.connect(config, env);

var Collection = require('../mongodb/searchEntry_model');

// Copycat
//

var copycatName = "Copycat";

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

var CopycatSchema = new mongoose.Schema({
  _id: Number,
  year: String,
  author: String,
  work: String,
  conductedBy: String,
  rep: String,
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

CopycatSchema.plugin(autoIncrement.plugin, copycatName);

var Copycat = mongoose.model(copycatName, CopycatSchema);

///

var i = 0;
Collection.find().exec(function(err, entries){
  if(err){ return console.log(err); }

  entries.forEach(function(entry){
    var params = {
      author: entry.Autora,
      work: entry.Obra,
      conductedBy: entry.dirige,
      rep: entry.Rep,
      year: entry.Anio,
    }

    newEntry = new Copycat(params);

    newEntry.save(function(err){
      i++;

      if(err){
        return console.log(err);
      }
      else{
        console.log("Processed " + i + " entries.");
      }
      if(i >= entries.length){
        console.log("Thank you. Job is done.")
      }
    });

  });

});
