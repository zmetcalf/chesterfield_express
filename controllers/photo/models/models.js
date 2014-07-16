var mongoose = require('mongoose');

var photo_schema = mongoose.Schema({
  title: String,
  post_date: { type: Date, default: Date.now },
  description: String,
  published: Boolean,
  _author: { type: String, ref: 'User' },
  url_slug: String,
});

var Photo = exports.Photo = mongoose.model('Photo', photo_schema);
