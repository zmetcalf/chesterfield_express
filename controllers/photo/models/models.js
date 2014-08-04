var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var photo_schema = mongoose.Schema({
  title: String,
  post_date: { type: Date, default: Date.now },
  description: String,
  published: Boolean,
  path: String,
  _author: { type: Schema.Types.ObjectId, ref: 'User' },
});

var Photo = exports.Photo = mongoose.model('Photo', photo_schema);
