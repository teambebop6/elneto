var mongoose = require('mongoose');

var SearchEntrySchema = new mongoose.Schema({
	_id: Number,
  year: {
    type: String,
  },
  author: {
    type: String,
  },
  work: {
    type: String,
  },
  conductedBy: {
    type: String,
  },
  rep: {
    type: String,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SearchEntry', SearchEntrySchema);
