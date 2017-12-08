var mongoose = require('mongoose');

var ImageSchema = new mongoose.Schema({
	_id: Number,
	src: String,
	description: String,
	title: String
});

var GalerySchema = new mongoose.Schema({
	_id: Number,
	title: String,
	location: String,
	dateOfPlay: Date,
	author: String,
	director: String,
	createdOn: Date,
	tags: [String],
	isActive: Boolean,
	isFavorite: Boolean,
	images: [ImageSchema],
	titlePicture: String
});

module.exports = mongoose.model('Galery', GalerySchema);
