var crypto = require('crypto'),
    models = require('../models'),
    async = require('async');

var cool_url_controllers = [ 'Content', 'Studio' ];

// Generates random password for users
exports.gen_password = function(callback) {
  crypto.randomBytes(10, function(err, buf) {
    if (err) return console.log(err);

    var pwd = buf.toString('base64')
    .slice(0, 10)
    .replace(/\+/g, '0')
    .replace(/\//g, '0');

    return callback(null, pwd);
  });
}


exports.get_cool_url = function(slug, callback) {
  async.detect(cool_url_controllers, function(_controller, callback) {
    models[_controller].findOne({ 'url_slug': slug }, 'url_slug',
      function(err, content) {
        if (err) return console.log(err);
        if (content) {
          return callback(true);
        } else {
          return callback(false);
        }
      })
  }, function(result) { return callback(null, result); });
}
