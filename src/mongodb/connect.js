var mongoose = require('mongoose');

exports.connect = function (config, env) {

  console.log("Connecting to db: " + config.DB_NAME);


  var options = {
    useMongoClient: true,
  }

  if (config.db && config.db.user && config.db.pass) {
    options.user = config.db.user;
    options.pass = config.db.pass;
  }

  // Connect to db
  mongoose.connect('mongodb://localhost:27017/' + config.DB_NAME, options);

  // CONNECTION EVENTS
  // When successfully connected
  mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open on port ' + config.DB_PORT || 27017);
  });

  // If the connection throws an error
  mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
  });

  mongoose.Promise = global.Promise;

  exports.mongoose = mongoose;
};
