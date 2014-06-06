var crypto = require('crypto');

// Generates random password for users
exports.gen_password = function(callback) {
  crypto.randomBytes(10, function(err, buf) {
    if(err) return console.log(err);

    var pwd = buf.toString('base64')
    .slice(0, 10)
    .replace(/\+/g, '0')
    .replace(/\//g, '0');

    return callback(null, pwd);
  });
}
