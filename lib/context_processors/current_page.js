var swig = require('swig');

module.exports = function logged_in(options) {
  return function(req, res, next) {
    swig.setDefaults({ locals: {  reqpath: req.path }});
    next();
  };
}
