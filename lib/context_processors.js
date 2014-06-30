var swig = require('swig');

module.exports = function context_processors(options) {
  return function(req, res, next) {
    if (req.session.user) {
      swig.setDefaults({ locals: { logged_in: true, reqpath: req.path }});
    } else {
      swig.setDefaults({ locals: { logged_in: false, reqpath: req.path  }});
    }
    next();
  };
}
