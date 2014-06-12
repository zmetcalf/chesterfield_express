var async = require('async'),
    content_model = require('../content/models/models'),
    user_model = require('../user/models/models');

exports.before = function(req, res, next) {
  if (req.session.user && req.session.user.is_staff) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

exports.list = function(req, res, next) {
  async.parallel({
    contents: function(callback) {
      content_model.Content.find({}, 'url_slug post_date title _author',
        function(err, contents) {
          if (err) return console.log(err);
          return callback(null,  contents);
      });
    },

    users: function(callback) {
      user_model.User.find({}, 'first_name last_name username is_staff _id',
        function(err, users) {
          if (err) return console.log(err);
          return callback(null, users);
      });
    },
  },

  function(err, results) {
    res.render('index', results);
  });
}
