var User = require('../../models').User;

exports.before = function(req, res, next) {
  next();
}

exports.list = function(req, res, next) {
  User.find(function(err, users) {
    if (err) return console.log(err);
    if (!users.length) {
      var hash = require('pwd').hash;
      hash('foobar', function(err, _salt, _hash) {
        if (err) throw err;
        User.create({
          first_name: '',
          last_name: 'Administrator',
          username: 'Admin',
          is_staff: true,
          hash: _hash,
          salt: _salt
        }, function(err, new_user) {
          if(err) return console.log(err);
          res.render('list');
        });
      });
    } else {
      res.render('list');
    }
  });
}
