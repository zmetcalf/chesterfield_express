var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    content_model = require('../../content/models/models'),
    async = require('async'),
    _ = require('underscore');

var studio_schema = mongoose.Schema({
  title: String,
  post_date: { type: Date, default: Date.now },
  description: String,
  published: Boolean,
  _author: { type: Schema.Types.ObjectId, ref: 'User' },
  _photos: [ { type: Schema.Types.ObjectId, ref: 'Photo' } ],
  seo_keywords: String,
  seo_description: String,
  url_slug: String,
});


// TODO Needs refactored into Utils
studio_schema.statics.is_unique_slug = function(slug, studio_id, callback) {
  var studio_model = this;
  async.parallel([
    function(callback) {
      content_model.Content.find({}, 'url_slug _id', function(err, contents) {
        if (err) return callback(err);
        callback(null, contents)
      });
    },

    function(callback) {
      studio_model.find({}, 'url_slug _id', function(err, studios) {
        if (err) return callback(err);
        callback(null, studios)
      });
    }
  ],

  function(err, results) {
    var fltrd = _.filter(_.flatten(results), function(result) {
      return slug == result.url_slug && studio_id != result._id;
    });

    if (fltrd.length) {
      return callback(null, false);
    } else {
      return callback(null, true);
    }
  });
}

var Studio = exports.Studio = mongoose.model('Studio', studio_schema);
