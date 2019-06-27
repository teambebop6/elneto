var mongoose = require('mongoose');

var BackupSchema = new mongoose.Schema({
	_id: Number,
	title: String,
	fileName: String,
	description: String,
	fileHash: String,
	creationDate: Date
});

module.exports = mongoose.model('Backup', BackupSchema);
