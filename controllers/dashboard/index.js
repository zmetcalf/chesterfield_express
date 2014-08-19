var async = require('async'),
    models = require('../../models');

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
      models.Content.find({}, 'url_slug post_date title _author',
        function(err, contents) {
          if (err) return console.log(err);
          return callback(null,  contents);
      });
    },

    users: function(callback) {
      models.User.find({}, 'first_name last_name username is_staff _id',
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
