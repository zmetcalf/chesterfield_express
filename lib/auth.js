var hash = require('pwd').hash;

exports.load_login = function(req, res) {
  if(req.session.user && req.session.user.is_staff) {
    res.redirect('/dashboards');
  } else if(req.session.user) {
    res.redirect('/'); // TODO Redirect to their profile
  } else {
    res.render('login', { error: res.locals.message });
  }
};

exports.authenticate = function(req, res) {
  authenticate(req.body.username, req.body.password, function(err, user){
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation
      req.session.regenerate(function(){
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.username;
        if(user.is_staff) {
          res.redirect('/dashboards');
        } else {
          res.redirect('/');
        }
      });
    } else {
      req.session.error = 'Authentication failed';
      res.redirect('/login');
    }
  });
};

exports.logout = function(req, res) {
  req.session.regenerate(function() {
    delete req.session.user;
    delete req.session.success;
    res.redirect('/');
  });
}

function authenticate(name, pass, fn) {
  var db = require('../controllers/user/models/models');

  if (!module.parent) console.log('authenticating %s:%s', name, pass);

  db.User.findOne({ 'username': name }, 'hash salt is_staff',
    function (err, user) {
      if (err) return console.log(err);
      // query the db for the given username
      if (!user) return fn(new Error('cannot find user'));
      // apply the same algorithm to the POSTed password, applying
      // the hash against the pass / salt, if there is a match we
      // found the user
      hash(pass, user.salt, function(err, hash){
        if (err) return fn(err);
        if (hash == user.hash) return fn(null, user);
        fn(new Error('invalid password'));
      });
  });
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}
