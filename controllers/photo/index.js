var model = require('./models/models'),
    user_model = require('../user/models/models');


exports.before = function(req, res, next) {
  if ((req.route.path === '/photo/:photo_id' && req.route.method==='get') ||
      req.session.user && req.session.user.is_staff) {
    var slug = req.params.photo_id;
    if (!slug) return next();

    model.Photo.findOne({ '_id': slug }, function(err, photo) {
      req.photo = photo;
      if (err) return console.log(err);
      if (!photo) return next('route');
      next();
    });
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}


exports.list = function(req, res, next) {
  async.parallel({
    photos: function(callback) {
      model.Photo.find({}, '_id post_date title _author studios',
        function(err, photos) {
          if (err) return console.log(err);
          return callback(null,  photos);
      });
    },

    users: function(callback) {
      user_model.User.find({}, 'first_name last_name _id',
        function(err, users) {
          if (err) return console.log(err);
          return callback(null, users);
      });
    },
  },

  function(err, results) {
    res.render('list', results);
  });
}
