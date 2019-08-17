/**
 * Created by Henry Huang on 2019/7/6.
 */
const mongoose = require('mongoose');

Photo = new (mongoose.Schema) ({
  title: String,
  link: String,
  order: {
    type: Number,
    default: new Date().getTime()
  },
});

const CuadoSchema = new mongoose.Schema({
  _id: Number,
  title: {
    type: String,
  },
  photos: [Photo],
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

CuadoSchema.statics.validate = ({ title }) => {
  if (!title) {
    throw new Error(`Title cannot be empty!`);
  }
  return null;
};

CuadoSchema.statics.toDTO = ({ _id: id, title, photos, visible, order, creationDate, lastModifiedDate }) => {
  return {
    id,
    title,
    photos,
    visible,
    order,
    creationDate,
    lastModifiedDate
  }
};

module.exports = mongoose.model('Cuado', CuadoSchema);
