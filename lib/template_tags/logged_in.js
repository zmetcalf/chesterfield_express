var swig = require('swig');

module.exports = function logged_in() {

  return function(req, res, next) {
    next();
  };
}
