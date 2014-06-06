var mongoose = require('mongoose'),
    _ = require('underscore');

var cms_schema = mongoose.Schema({
  title: String,
  post_date: { type: Date, default: Date.now },
  summary: String,
  content: String,
  published: Boolean,
  _author: { type: String, ref: 'User' },
  seo_keywords: String,
  seo_description: String,
  url_slug: String,
});

cms_schema.statics.is_unique_slug = function(slug, content_id, callback) {
  this.find({}, 'url_slug', function(err, contents) {
    if (err) return console.log(err);

    var fltrd = _.filter(contents, function(content) {
        return slug == content.url_slug;
    });

    _.each(fltrd, function(content) {
      if(content._id != content_id) {
        return callback(null, false);
      } else {
        return callback(null, true);
      }

    });
  });
}

var Content = exports.Content = mongoose.model('Content', cms_schema);
