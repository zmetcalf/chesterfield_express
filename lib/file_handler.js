var busboy = require('connect-busboy'),
    fs = require('fs'),
    path = require('path');

module.exports = function(options) {
  return function(req, res, next) {
    if (req.method !== 'GET') {
      req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        if (fieldname === 'image_upload') {
          if (mimetype === 'image/jpeg' || mimetype === 'image/png') {
            // TODO add prevention of overwriting files
            var save_to = path.join(__dirname, '../media/', filename);
            file.pipe(fs.createWriteStream(save_to));
            req.image = { path: save_to }
          }
        }
      });
    }
    next();
  };
}
