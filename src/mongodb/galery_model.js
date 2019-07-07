const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  _id: Number,
  src: String,
  title: String,
  description: String,
  width: Number,
  height: Number,
  sort: Number,
});

const GalerySchema = new mongoose.Schema({
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
  categories: [String],
  isActive: Boolean,
  isFavorite: Boolean,
  images: [ImageSchema],
  titlePicture: String
});

GalerySchema.statics.toDTO = (dbObject) => {
  return dbObject.toObject();
};

module.exports = mongoose.model('Galery', GalerySchema);
