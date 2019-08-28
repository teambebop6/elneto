/**
 * Created by Henry Huang on 2019/8/28.
 */
const mongoose = require('mongoose');

PhotoSchema = new (mongoose.Schema)({
  title: String,
  link: String,
  width: Number,
  height: Number,
  size: Number,
  technik: String,
  comments: String,
  order: {
    type: Number,
    default: new Date().getTime()
  },
});

module.exports = PhotoSchema;
