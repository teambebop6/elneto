const mongoose = require('mongoose');

const BackupSchema = new mongoose.Schema({
  _id: Number,
  title: String,
  fileName: String,
  filePath: String,
  description: String,
  fileHash: String,
  creationDate: Date,
  lastRestoredDate: Date,
});

module.exports = mongoose.model('Backup', BackupSchema);
