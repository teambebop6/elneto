/**
 * Created by Henry Huang on 2019/7/6.
 */
const mongoose = require('mongoose');
const PhotoSchema = require('./schema/photo_schema');

const YonnyFotoSchema = new mongoose.Schema({
  _id: Number,
  title: {
    type: String,
  },
  photos: [PhotoSchema],
  visible: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: new Date().getTime()
  },
  creationDate: {
    type: Date,
    default: Date.now,
  },
  lastModifiedDate: {
    type: Date,
    default: Date.now,
  }
});

YonnyFotoSchema.statics.validate = ({ title }) => {
  if (!title) {
    throw new Error(`Title cannot be empty!`);
  }
  return null;
};

YonnyFotoSchema.statics.toDTO = ({ _id: id, title, photos, visible, order, creationDate, lastModifiedDate }) => {
  return {
    id,
    title,
    photos: photos.map(p => {
      return {
        title: p.title,
        link: p.link,
        width: p.width,
        height: p.height,
        size: p.size,
        technik: p.technik,
        comments: p.comments,
      }
    }),
    visible,
    order,
    creationDate,
    lastModifiedDate
  }
};

module.exports = mongoose.model('YonnyFoto', YonnyFotoSchema);
