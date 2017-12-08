var mongoose = require('mongoose');
var Counter = require('./counter_model');
var ImageSchema = new mongoose.Schema({
	_id: Number,
	src: String,
	title: String,
	description: String
});


/*
// Auto increment of id
ImageSchema.pre('save', function(next){
	
	var doc = this;
	Counter.findByIdAndUpdate({_id: 'galery-image'}, {$inc: {seq: 1}}, {upsert: true, new: true}, function(error, counter){
		if(error){ return next(error); }
		doc._id = counter.seq;
		next();
	});
});
*/
module.exports = mongoose.model('Image', ImageSchema); 
