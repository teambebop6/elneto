/**
 * Created by Henry Huang on 2019/7/6.
 */
const mongoose = require('mongoose');

const PoemSchema = new mongoose.Schema({
  _id: Number,
  title: {
    type: String,
  },
  // collection
  poemCollection: {
    type: String,
    default: ''
  },
  content: {
    type: String,
  },
  year: String,
  author: {
    type: String,
    default: 'yonny'
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

PoemSchema.statics.validate = ({ title, content }) => {
  if (!title) {
    throw new Error(`Title cannot be empty!`);
  }
  if (!content) {
    throw new Error(`Content cannot be empty!`);
  }
  return null;
};

PoemSchema.statics.toDTO = ({ _id: id, title, poemCollection, year, author, content, visible, order, creationDate, lastModifiedDate }) => {
  return {
    id,
    title,
    poemCollection,
    year,
    author,
    content,
    visible,
    order,
    creationDate,
    lastModifiedDate
  }
};

module.exports = mongoose.model('Poem', PoemSchema);
