var model = require('./models/models');

exports.before = function(req, res, next) {
  if (req.session.user && req.session.user.is_staff) {
    var username = req.params.user_id;
    if (!username) return next();

    model.User.findOne({ 'username': username },
      'first_name last_name is_staff username',
      function(err, user) {
        req.user = user;
        if (err) return console.log(err);
        if (!user) return next(new Error('User not found'));
        next();
    });
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

exports.list = function(req, res, next) {
  model.User.find({}, 'first_name last_name is_staff username',
    function(err, users) {
      if (err) return console.log(err);
      res.render('list', { 'users': users });
    });
}

exports.edit = function(req, res, next) {
  res.render('edit', { user: req.user });
}

exports.show = function(req, res, next) {
  res.render('show', { user: req.user });
}

exports.update = function(req, res, next) {
  res.messag('Information updated!');
  res.redirect('/user/' + req.user.id);
}
