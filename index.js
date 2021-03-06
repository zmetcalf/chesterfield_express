var express = require('express'),
  logger = require('morgan'),
  session = require('express-session'),
  bodyParser = require('body-parser'),
  busboy = require('connect-busboy'),
  csrf = require('csurf'),
  helmet = require('helmet'),
  methodOverride = require('method-override'),
  mongoose = require('mongoose'),
  MongoStore = require('connect-mongo')(session),
  swig = require('swig'),
  path = require('path'),
  secret_key = require('./config/site').secret_key,
  context_processors = require('./lib/context_processors');

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

// Import Custom Template Objects
var tf = require('./lib/template_filters');

// setup db
var db_opts = require('./config/db');

if(!module.parent && !mongoose.connection.readyState) {
  mongoose.connect('mongodb://localhost/' + db_opts.db_name, db_opts.options);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'db connection error:'));
}

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
app.use('/static', express.static(__dirname + '/public'));
app.use('/media', express.static(__dirname + '/media'));

// Helmet for safe headers
app.use(helmet.csp());
app.use(helmet.xframe('deny'));
app.use(helmet.xssFilter());
app.use(helmet.nosniff());

// session support
app.use(session({
  secret: secret_key,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    url: 'mongodb://' + db_opts.options.user + ':' + db_opts.options.pass +
         '@localhost:27017/' + db_opts.db_name + '/sessions'
  }),
}));

// parse request bodies (req.body)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// override methods (put, delete)
app.use(methodOverride('_method'));

// Initialize CSRF
var csrfValue = function(req) {
  var token = (req.body && req.body._csrf)
    || (req.query && req.query._csrf)
    || (req.headers['x-csrf-token'])
    || (req.headers['x-xsrf-token']);
  return token;
};

app.use(csrf({value: csrfValue}));

// Angular CSRF Token
app.use(function(req, res, next) {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
});

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

// File Handling
app.use(busboy({ immediate: true }));

// Context processors for templates - Must come after session - before controllers
app.use(context_processors());

// load controllers
require('./lib/boot')(app, { verbose: !module.parent });

// Additional Routes
var login = require('./lib/auth');
app.get('/login', login.load_login);
app.post('/login', login.authenticate);
app.get('/logout', login.logout);

var photo_ajax = require('./controllers/photo/ajax/index');
app.get('/photo_ajax/:id', photo_ajax.get_photo);

// CoolURL Routes
var cool_router = require('./lib/cool_router');
var ctrl = app.get('/:id', cool_router);

app.use(function(err, req, res, next){
  // log it
  if (!module.parent) console.error(err.stack);

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

