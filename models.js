var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    async = require('async'),
    _ = require('underscore');


var user_schema = mongoose.Schema({
  first_name: String,
  last_name: String,
  username: String,
  is_staff: Boolean,
  hash: String,
  salt: String,
});

user_schema.statics.is_unique_user = function(username, callback) {
  this.find({}, 'username', function(err, users) {
    if (err) return console.log(err);
    async.detect(users, function(user, callback) {
      callback(username == user.username);
    }, function(user) {
      return callback(null, !user);
    });
  });
}


var photo_schema = mongoose.Schema({
  title: String,
  post_date: { type: Date, default: Date.now },
  description: String,
  published: Boolean,
  path: String,
  _author: { type: Schema.Types.ObjectId, ref: 'User' },
});


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
      Studio.find({}, 'url_slug _id', function(err, studios) {
        if (err) return callback(err);
        callback(null, studios)
      });
    }
  ],

  function(err, results) {
    async.detect(_.flatten(results), function(result, callback) {
      callback(slug == result.url_slug && content_id != result._id);
    }, function(result) {
      return callback(null, !result);
    });
  });
}


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
      Content.find({}, 'url_slug _id', function(err, contents) {
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
    async.detect(_.flatten(results), function(result, callback) {
      callback(slug == result.url_slug && studio_id != result._id);
    }, function(result) {
      return callback(null, !result);
    });
  });
}


var Studio = exports.Studio = mongoose.model('Studio', studio_schema);
var Content = exports.Content = mongoose.model('Content', cms_schema);
var Photo = exports.Photo = mongoose.model('Photo', photo_schema);
var User = exports.User = mongoose.model('User', user_schema);
