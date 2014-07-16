var model = require('./models/models');

exports.before = function(req, res, next) {
  if ((req.route.path === '/photo/:photo_id' && req.route.method==='get') ||
      req.session.user && req.session.user.is_staff) {
    var slug = req.params.photo_id;
    if (!slug) return next();

    model.Photo.findOne({ 'url_slug': slug }, function(err, photo) {
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
