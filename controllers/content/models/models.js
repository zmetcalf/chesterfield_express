var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore');

var cms_schema = mongoose.Schema({
  title: String,
  post_date: { type: Date, default: Date.now },
  summary: String,
  content: String,
  published: Boolean,
  _author: { type: Schema.Types.ObjectId, ref: 'User' },
  seo_keywords: String,
  seo_description: String,
  url_slug: String,
});

cms_schema.statics.is_unique_slug = function(slug, content_id, callback) {
  this.find({}, 'url_slug _id', function(err, contents) {
    if (err) return callback(err);

    var fltrd = _.filter(contents, function(content) {
      return slug == content.url_slug && content_id != content._id;
    });

    if (fltrd.length) {
      return callback(null, false);
    } else {
      return callback(null, true);
    }
  });
}

var Content = exports.Content = mongoose.model('Content', cms_schema);
