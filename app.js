var express = require('express'),
  logger = require('morgan'),
  swig = require('swig'),
  path = require('path'),
  _ = require('underscore');

var app = module.exports = express();

// Setup Swig templates
app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'app/views'));

app.set('view cache', false);

// Change to true for production
swig.setDefaults({ cache: false });

// Logger
if (!module.parent) app.use(logger('dev'));

require('./lib/boot')(app, { verbose: !module.parent });

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
