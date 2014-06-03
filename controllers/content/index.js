exports.before = function(req, res, next) {
  if (req.session.user.is_staff) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

exports.list = function(req, res, next) {
  res.render('list');
}
