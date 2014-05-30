var mongoose = require('mongoose');
var db_opts = require('./config/db');

mongoose.connect('mongodb://localhost/' + db_opts.db_name, db_opts.options);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'db connection error:'));

var user_schema = mongoose.Schema({
  first_name: String,
  last_name: String,
  username: String,
  hash: String,
  salt: String,
});

var cms_schema = mongoose.Schema({
  title: String,
  content_post_date: { type: Date, default: Date.now },
  content: String,
  summary: String,
  published: Boolean,
  author: { type: Number, ref: 'User' },
  seo_keywords: String,
  seo_description: String,
  url_slug: String,
});

var User = exports.User = mongoose.model('User', user_schema);
var Content = exports.Content = mongoose.model('Content', cms_schema);

// Creates default user - TODO Needs replaced
User.find(function(err, users) {
  if (err) return console.log(err);
  if (!users.length) {
    var hash = require('./lib/login/pass').hash;
    hash('foobar', function(err, _salt, _hash) {
      if (err) throw err;
      User.create({
        first_name: 'Test',
        last_name: 'User',
        username: 'user',
        hash: _hash,
        salt: _salt
      }, function(err, new_user) {
        if(err) return handleError(err);
      });
    });
  }
});
