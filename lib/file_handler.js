var busboy = require('connect-busboy'),
    fs = require('fs'),
    path = require('path'),
    os = require('os');

module.exports = function(options) {
  return function(req, res, next) {
    if (req.method !== 'GET') {
      req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        console.log(mimetype);
        console.log(fieldname);
        if (fieldname === 'image_upload') {
          if (mimetype === 'image/jpeg' || mimetype === 'image/png') {
            var save_to = path.join(os.tmpDir(), path.basename(fieldname));
            file.pipe(fs.createWriteStream(save_to));
            req.image = { path: image_path }
          }
        }
      });
    }
    next();
  };
}
