var mongoose = require('mongoose');
var crypto = require('crypto');

var UserSchema = new mongoose.Schema({
	_id: String,
	salt: String,
	password: String
});

// Override save method
UserSchema.pre('save', function(next){
	var user = this;

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	var salt = crypto.randomBytes(128).toString('base64');
	crypto.pbkdf2(user.password, salt, 10000, 512, 'sha512' , function(err, hash) {
		user.password = hash.toString('base64');
		user.salt = salt;

		next();
	});
});

module.exports = mongoose.model('User', UserSchema);
