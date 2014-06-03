var express = require('express'),
  logger = require('morgan'),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  mongoose = require('mongoose'),
  swig = require('swig'),
  path = require('path');

var app = module.exports = express();

// Setup Swig templates
app.engine('html', swig.renderFile);

app.set('view engine', 'html');

app.set('view cache', false);

// Change to true for production
swig.setDefaults({
  cache: false,
  loader: swig.loaders.fs(__dirname + '/views')
});

// set views for error and 404 pages
app.set('views', __dirname + '/views');

// setup db
var db_opts = require('./config/db');

mongoose.connect('mongodb://localhost/' + db_opts.db_name, db_opts.options);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'db connection error:'));

// define a custom res.message() method
// which stores messages in the session
app.response.message = function(msg){
  // reference `req.session` via the `this.req` reference
  var sess = this.req.session;
  // simply add the msg to an array for later
  sess.messages = sess.messages || [];
  sess.messages.push(msg);
  return this;
};

// log
if (!module.parent) app.use(logger('dev'));

// serve static files
app.use(express.static(__dirname + '/public'));

// session support
app.use(cookieParser('some secret here'));
app.use(session());

// parse request bodies (req.body)
app.use(bodyParser());

// override methods (put, delete)
app.use(methodOverride());

// expose the "messages" local variable when views are rendered
app.use(function(req, res, next){
  var err = req.session.error;
  var success = req.session.success;
  var msgs = req.session.messages || [];

  // Login session handling
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';

  if (err) res.locals.message = '<div class="alert alert-danger">' + err + '</div>';
  if (success) res.locals.message = '<div class="alert alert-success">' + success + '</div>';

  // expose "messages" local variable
  res.locals.messages = msgs;

  // expose "hasMessages"
  res.locals.hasMessages = !! msgs.length;

  next();
  // empty or "flush" the messages so they
  // don't build up
  req.session.messages = [];
});

// load controllers
require('./lib/boot')(app, { verbose: !module.parent });

// Additional Routes
var login = require('./lib/auth');
app.get('/login', login.load_login);
app.post('/login', login.authenticate);
app.get('/logout', login.logout);

// assume "not found" in the error msgs
// is a 404. this is somewhat silly, but
// valid, you can do whatever you like, set
// properties, use instanceof etc.
app.use(function(err, req, res, next){
  // treat as 404
  if (~err.message.indexOf('not found')) return next();

  // log it
  console.error(err.stack);

  // error page
  res.status(500).render('5xx');
});

// assume 404 since no middleware responded
app.use(function(req, res, next){
  res.status(404).render('404', { url: req.originalUrl });
});

if (!module.parent) {
  var server = app.listen(3000, function() {
    console.log('\nListening on port %d\n', server.address().port);
  });
}
