var swig = require('swig');

module.exports = function logged_in(options) {
  return function(req, res, next) {
    if (req.session.user) {
      swig.setDefaults({ locals: {  logged_in: true }});
    } else {
      swig.setDefaults({ locals: {  logged_in: false }});
    }
    next();
  };
}
