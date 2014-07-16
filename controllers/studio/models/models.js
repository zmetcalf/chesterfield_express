var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var studio_schema = mongoose.Schema({
  title: String,
  post_date: { type: Date, default: Date.now },
  description: String,
  published: Boolean,
  _author: { type: Schema.Types.ObjectId, ref: 'User' },
  _photos: [ { type: Schema.Types.ObjectId, ref: 'Photo' } ],
  url_slug: String,
});

var Studio = exports.Studio = mongoose.model('Studio', studio_schema);
