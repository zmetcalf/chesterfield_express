var model = require('../studio/models/models');

exports.before = function(req, res, next) {
  if (req.session.user && req.session.user.is_staff) {
    var slug = req.params.studio_photo_selector_id;
    if (!slug) return next();

    model.Studio.findOne({ '_id': slug }, function(err, studio) {
      req.studio = studio;
      if (err) return console.log(err);
      if (!studio) return next('route');
      next();
    });
  } else {
    res.json(null);
  }
}


exports.show = function(req, res, next) {
  res.json(req.studio._photos);
}