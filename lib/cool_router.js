var utils = require('./utils');

module.exports = function (req, res, next) {
  utils.get_cool_url(req.params.id, function(err, controller) {
    if (controller) {
      req.route.path === '/' + controller.toLowerCase() + '/:' +
        controller.toLowerCase() + "_id";
      req.params[controller.toLowerCase() + '_id'] = req.params.id;

      var ctrl = require('../controllers/' + controller.toLowerCase());

      if (ctrl.before) {
        ctrl.before(req, res, function() {
          ctrl.show(req, res);
        });
      } else {
        ctrl.show(req, res);
      }
    } else {
      next();
    }
  });
};
