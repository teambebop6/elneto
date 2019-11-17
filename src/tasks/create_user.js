var mongoose = require('mongoose')
var User = require('../mongodb/user_model')
var Counter = require('../mongodb/counter_model')

var env = process.env.NODE_ENV || 'development';
console.log(`Env is ${env}`);

var config = require('../config')(env);
console.log(JSON.stringify(config));

var db = require('../mongodb/connect');
db.connect(config, env);

if(process.argv[2] && process.argv[3]){

	console.log("Password is: " + process.argv[3]);
	var user = new User({
		_id : process.argv[2],
		password : process.argv[3]
	});

	user.save(function(err, item){
		if(err) throw err;

		console.log("User successfully created!");
	});
}
