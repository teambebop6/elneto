var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var counter = new Schema({
	_id: {type: String, required: true},
	seq: {type: Number, default: 0}
});

//Counters.statics.findAndModify = function (query, sort, doc, options, callback) {
//  return this.collection.findAndModify(query, sort, doc, options, callback);
//  };
	
var Counter = mongoose.model('Counter', counter, 'counters');

module.exports = Counter;
