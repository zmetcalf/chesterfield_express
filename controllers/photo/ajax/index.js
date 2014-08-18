var model = require('../models/models');

exports.get_photo = function(req, res) {
  model.Photo.findOne({ '_id': req.params.id }, function(err, photo) {
    if (err) return console.log(err);
    res.send(")]}',\n" + JSON.stringify(photo));
  });
};
