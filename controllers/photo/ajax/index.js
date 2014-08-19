var models = require('../../../models');

exports.get_photo = function(req, res) {
  models.Photo.findOne({ '_id': req.params.id }, function(err, photo) {
    if (err) return console.log(err);
    res.send(")]}',\n" + JSON.stringify(photo));
  });
};
