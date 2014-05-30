var hash = require('./pass').hash;

exports.load_login = function(req, res) {
  res.render('../lib/login/views/login', {});
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
        req.session.success = 'Authenticated as ' + user.name
          + ' click to <a href="/logout">logout</a>. '
          + ' You may now access <a href="/restricted">/restricted</a>.';
        res.redirect('/');
      });
    } else {
      req.session.error = 'Authentication failed, please check your '
        + ' username and password.'
        + ' (use "tj" and "foobar")';
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
  db = require('../../db');
  if (!module.parent) console.log('authenticating %s:%s', name, pass);
  process.nextTick(function() {
    db.User.findOne({ 'username': name }, 'hash salt',
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