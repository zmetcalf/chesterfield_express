var model = require('../studio/models/models'),
    photo_model = require('../photo/models/models'),
    _ = require('underscore');

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
  photo_model.Photo.find({}, 'title description path', function(err, photos) {
    if (err) return console.log(err);
    var all_photos = '"all_photos":' + JSON.stringify(photos);
    var studio_photos = '"studio_photos":' + JSON.stringify(req.studio._photos);
    res.send(")]}',\n{" + studio_photos + ',' + all_photos + '}'); // Angular JSON protection
  });
}


exports.update = function(req, res, next) {
  model.Studio.findOne({ _id: req.studio._id }, '_photos', function(err, studio) {
    if(err) return console.log(err);
    _.each(req.body, function(selected_photo) {
      if (!_.find(studio._photos, function(photo) { return photo.equals(selected_photo); })) {
        studio._photos.push(selected_photo);
      }
    });
    studio.save(function (err) {
      if (err) return console.log(err);
      res.json({ updated: true });
    });
  });
}
