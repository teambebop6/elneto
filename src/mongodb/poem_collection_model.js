/**
 * Created by Henry Huang on 2019/7/6.
 */
const mongoose = require('mongoose');

const PoemCollectionSchema = new mongoose.Schema({
  _id: Number,
  title: {
    type: String,
  },
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

PoemCollectionSchema.statics.validate = ({ title }) => {
  if (!title) {
    throw new Error(`Title cannot be empty!`);
  }
  return null;
};

PoemCollectionSchema.statics.toDTO = ({ _id: id, title, visible, order, creationDate, lastModifiedDate }) => {
  return {
    id,
    title,
    visible,
    order,
    creationDate,
    lastModifiedDate
  }
};

module.exports = mongoose.model('PoemCollection', PoemCollectionSchema);
