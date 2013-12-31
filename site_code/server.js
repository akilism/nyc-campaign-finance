'use strict';

// Module dependencies.
var express = require('express'),
    path = require('path');

var app = express();

// Express Configuration
app.configure('development', function(){
  app.use(require('connect-livereload')());
  app.use(express.static(path.join(__dirname, '.tmp')));
  app.use(express.static(path.join(__dirname, 'app')));
  app.use(express.errorHandler());
  app.set('views', __dirname + '/app/views');
});

app.configure('production', function(){
  app.use(express.favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(express.static(path.join(__dirname, 'public')));
  app.set('views', __dirname + '/views');
});

app.configure(function(){
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());

  // Router needs to be last
	app.use(app.router);
});

// Controllers
var api = require('./lib/controllers/api'),
    controllers = require('./lib/controllers');

// Server Routes
app.get('/api/candidates', api.candidates);
app.get('/api/candidates/:candidateId?', api.candidateDetails);
app.get('/api/candidates/:candidateId?/months', api.candidateMonthly);
app.get('/api/candidates/:candidateId?/occupations/:count?', api.candidateTopOccupations);
app.get('/api/candidates/:candidateId?/contributors/:count?', api.candidateTopContributors);
app.get('/api/candidates/:candidateId?/employers/:count?', api.candidateTopEmployers);
app.get('/api/offices', api.offices);
app.get('/api/zip_codes', api.zipCodes);
app.get('/api/offices/:officeId?', api.candidatesByOffice);

// Angular Routes
app.get('/partials/*', controllers.partials);
app.get('/*', controllers.index);

// Start server
var port = process.env.PORT || 8088;
app.listen(port, function () {
  console.log('Express server listening on port %d in %s mode', port, app.get('env'));
});