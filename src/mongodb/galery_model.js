const mongoose = require('mongoose');
const PhotoSchema = require('./schema/photo_schema');

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
  isActive: Boolean,
  isFavorite: Boolean,
  images: [PhotoSchema],
  titlePicture: String,
  order: {
    type: Number,
    default: new Date().getTime()
  },
});

GalerySchema.statics.toDTO = (dbObject) => {
  return dbObject.toObject();
};

module.exports = mongoose.model('Galery', GalerySchema);
