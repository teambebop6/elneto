var express = require('express');
var app = express();

var path = require('path'); // path module
var favicon = require('serve-favicon'); // favicon module
var logger = require('morgan'); // Logging engine
var cookieParser = require('cookie-parser'); // Cookie parser
var fs = require('fs'); // Filesystem module
var crypto = require('crypto'); // Cryptography module
var utils = require('./utils/utils');

// Body parser
var bodyParser = require('body-parser'); // Request body parser

app.use(bodyParser.urlencoded({ extended: true })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()) // parse application/json


var env = process.env.NODE_ENV || 'development';

// Load config
var config = require('./config')(env);
utils.printMaskedConfig(config);

app.use(function(req, res, next){
	req.config = config;
	next();
});

var port = process.env.PORT || config.APP_PORT || 3000;
var host = process.env.HOST || config.APP_HOST || "localhost";

app.set('port', port);
app.set('host', host);

// Database
var db = require('./mongodb/connect');
db.connect(config, env);

// Load templating engine
var exphbs = require('express-handlebars');
var helpers = require('./lib/helpers'); 

// Server
var debug = require('debug')('elneto');
var http = require('http'); // http server
var app_name = "Elneto Fotos";

// Initialize redis based session
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var sess = {
	resave: true,
	saveUninitialized: true,
	secret: config.SESSION_SECRET,
	cookie:{ maxAge:24*60*60*1000 },
	store: new RedisStore({
		host: 'localhost',
		port: config.redis.port	
	})    	
}
app.use(session(sess));

// Load connect-flash
var flash = require('connect-flash');
app.use(flash());

// Passport.js for authentication
var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'views/'));


// Create `ExpressHandlebars` instance with a default layout.
var hbs = exphbs.create({
  defaultLayout: 'main',
  helpers      : helpers,
  layoutsDir: path.join(__dirname, 'views/layouts'),
  // Uses multiple partials dirs, templates in "shared/templates/" are shared
  // with the client-side of the app (see below).
  partialsDir: [
    path.join(__dirname, 'shared/templates/'),
    path.join(__dirname, 'views/partials/'),
    path.join(__dirname, 'views/scripts/'),
  ]
});

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Load router
app.use(function(req, res, next) {
  if (req.path.substr(-1) == '/' && req.path.length > 1) {
    var query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});
app.use('/', require('./routes/router.js'));

debug('Booting %s', app_name);

//var server = http.createServer(app);
var server = app.listen(app.get('port'), function(){
  console.log('Express server listening on ' + app.get('host') + ":" + app.get('port'));
});

module.exports = app;
