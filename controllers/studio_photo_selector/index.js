var models = require('../../models');

exports.before = function(req, res, next) {
  if (req.session.user && req.session.user.is_staff) {
    var slug = req.params.studio_photo_selector_id;
    if (!slug) return next();

    models.Studio.findOne({ '_id': slug }, function(err, studio) {
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
  models.Photo.find({}, 'title description path', function(err, photos) {
    if (err) return console.log(err);
    var all_photos = '"all_photos":' + JSON.stringify(photos);
    var studio_photos = '"studio_photos":' + JSON.stringify(req.studio._photos);
    res.send(")]}',\n{" + studio_photos + ',' + all_photos + '}'); // Angular JSON protection
  });
}


exports.update = function(req, res, next) {
  models.Studio.findOne({ _id: req.studio._id }, '_photos', function(err, studio) {
    if(err) return console.log(err);

    // Mongoose validates req.body
    studio._photos = req.body;

    studio.save(function (err) {
      if (err) return console.log(err);
      res.json(req.body);
    });
  });
}
