var mongoose = require('mongoose');

var ImageSchema = new mongoose.Schema({
	_id: Number,
	src: String,
  title: String,
	description: String,
	width: Number,
  height: Number,
  sort: Number,
});

var GalerySchema = new mongoose.Schema({
	_id: Number,
	title: String,
	location: String,
	dateOfPlay: Date,
	author: String,
	director: String,
	info1: String,
	info2: String,
	createdOn: Date,
	tags: [String],
	isActive: Boolean,
	isFavorite: Boolean,
	images: [ImageSchema],
	titlePicture: String
});

module.exports = mongoose.model('Galery', GalerySchema);
