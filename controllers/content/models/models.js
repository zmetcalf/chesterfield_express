var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    studio_model = require('../../studio/models/models'),
    async = require('async'),
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


// TODO Needs Refactored into utils
cms_schema.statics.is_unique_slug = function(slug, content_id, callback) {
  var content_model = this;
  async.parallel([
    function(callback) {
      content_model.find({}, 'url_slug _id', function(err, contents) {
        if (err) return callback(err);
        callback(null, contents)
      });
    },

    function(callback) {
      studio_model.Studio.find({}, 'url_slug _id', function(err, studios) {
        if (err) return callback(err);
        callback(null, studios)
      });
    }
  ],

  function(err, results) {
    var fltrd = _.filter(_.flatten(results), function(result) {
      return slug == result.url_slug && content_id != result._id;
    });

    if (fltrd.length) {
      return callback(null, false);
    } else {
      return callback(null, true);
    }
  });
}

var Content = exports.Content = mongoose.model('Content', cms_schema);
