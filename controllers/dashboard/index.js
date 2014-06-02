exports.before = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

exports.list = function(req, res, next) {
  res.render('index');
}
