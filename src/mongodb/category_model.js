/**
 * Created by Henry Huang on 2019/7/6.
 */
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  _id: Number,
  title: {
    type: String,
  },
  key: {
    type: String,
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

CategorySchema.statics.validate = ({ title }) => {
  if (!title) {
    throw new Error(`Title cannot be empty!`);
  }
  return null;
};

CategorySchema.statics.toDTO = ({ title, key, creationDate, lastModifiedDate }) => {
  return {
    title,
    key,
    creationDate,
    lastModifiedDate
  }
};

module.exports = mongoose.model('Category', CategorySchema);
