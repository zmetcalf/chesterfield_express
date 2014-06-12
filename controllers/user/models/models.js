var mongoose = require('mongoose'),
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

    if(_.find(users, function(user) { return username == user.username; })) {
      return callback(null, false);
    } else {
      return callback(null, true);
    }
  });
}

var User = exports.User = mongoose.model('User', user_schema);
