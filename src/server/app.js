/*************************************************************************
 *
 * COMPRO CONFIDENTIAL
 * __________________
 *
 *  [2015] - [2020] Compro Technologies Private Limited
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Compro Technologies Private Limited. The
 * intellectual and technical concepts contained herein are
 * proprietary to Compro Technologies Private Limited and may
 * be covered by U.S. and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law.
 *
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Compro Technologies Pvt. Ltd..
 ***************************************************************************/
 
/***********************************************************
 * This module configures express app.
 * Defines backend endpoints
 ************************************************************/
'use strict';

/*
 * Load errorhandler before all other modules. 
 * This enables catching errors which occur on server startup.
 */
var ErrorHandler = require('./error/error-handler');

/*
* Enable NewRelic Monitoring for all environments except local
* Newrelic should be loaded before all other modules. Dont move this code snippet down.
*/
var appEnvironment = require('./config/env').appEnv;
if (appEnvironment != "local" && process.env.NEW_RELIC_APP_NAME ) {
    require ('newrelic');
}

/************************************
 * External npm Modules
************************************/
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var passport = require('passport');
var redisStore = require('connect-redis')(session);
var exphbs  = require('express-handlebars');


/************************************
* Internal npm Modules
************************************/
//Redis Connector
var redis = require('./libs/redis');
//Request Utilities
var reqUtils = require('./libs/request-utils');
//Application Utilities
var appUtils = require('./libs/app-utils');
//Configuration 
var config = require('./config');

//Controllers

//User Auth handler
var authController = require("./controllers/auth-controller");
//App Context handler
var appContextController = require("./controllers/appcontext-controller");

/************************************
 * Private Variables
************************************/
//Instantiate Redis client
var redisClient = redis.redisClient;
//Get Build mode
var buildMode = process.env.DLS_UNCOMPRESSED_MODE ? "development" : "production";
// Initiate Express App	
var app = express();

// Support JSON-encoded bodies
app.use(bodyParser.json({
	limit: '5mb'
}));

// Support URL-encoded bodies     
app.use(bodyParser.urlencoded({
	limit: '5mb', 
	extended: true
}));

/**********************************
* Configure Handlebars View engine
***********************************/
app.engine('hbs', exphbs({
    helpers: {   
        getObject: function(context) {
            return JSON.stringify(context);
        }
    }
}));
app.set('view engine', 'hbs');

// In production build mode, set dist folder as views directory
if(buildMode === 'production') {
	app.set('views', path.join(__dirname, '/../../dist'));
}
// In development build mode, set .tmp folder as views directory
else {
	app.set('views', path.join(__dirname, '/../../.tmp/serve'));
}

/**********************************
* Authentication/Authorization
***********************************/
var cookieConfig = {};

//Local Authentication - Change cookie domain if SSO is enabled
if (config.app.authentication.defaultMethod == "local" && config.app.authentication.local.cookieSsoEnabled) {
	cookieConfig.domain = config.app.authentication.local.cookieDomain;
}
//Use REDIS as session store
app.use(session(
	{
		secret: config.app.session["cookie-secret"], 
		store: new redisStore({client: redisClient}),
		saveUninitialized:true,
		resave:false,
		cookie: cookieConfig				
	}
));

//Initialize passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  if(user)		
	  done(null, user);
});
passport.deserializeUser(function(userObj, done) {		
	  done(null,userObj);
});

/**********************
 * Route Definitions
 **********************/
var redirectToHttps = appUtils.redirectToHttps();

//Redirect all HTTP calls to HTTPS (based on config variable)
app.use(function (req, res, next) {
	if(redirectToHttps && !reqUtils.isHttps(req)){
		res.redirect('https://' + req.headers.host + req.url);
	} else {
		next();
	}
});

/****************************
 * Authenticated Routes
 ****************************/
//Logout Handler
app.get('/auth/logout', authController.isAuthenticated, authController.logout);
// Handler to get app context
app.get('/appcontext', authController.isAuthenticated, appContextController.getAppContext);

/****************************
 * Unauthenticated Routes
 ****************************/
//Local Authentication - Login (Form Post) Handler
app.post('/auth/login', authController.localLogin);

//One time Auth URLs handlers
//ota step1
app.get('/dau/:encodedKey', authController.otaStep1);
//ota step2
app.post('/auth/verify',authController.otaStep2);

//Javascript Error Handler
app.post('/error/javascript', ErrorHandler.frontendErrorController);

// Express Static configuration for static files (JS/CSS/Fonts etc.)
if(buildMode === 'production') {
	app.use(express.static('dist'));
	app.use('/bower_components', express.static('bower_components'));	
} else{
	app.use(express.static('.tmp/serve'));
    app.use(express.static('src'));
    app.use('/bower_components', express.static('bower_components'));
}

// Token Authentication
// If request query param token is present, Use token for authentication
app.use(function (req, res, next) {
	if (req.query.token && req.query.orgid) {
        authController.tokenAuthentication(req,res);
    } else {
        next();
    }
});

// App Entry Handler
app.get('/', function(req, res, next){
	// If this is not a redirect from OTA Authentication, OTA ERROR or TOKEN Auth ERROR , TOKEN Authentication and default authentication method is CAS  
	if (config.app.authentication.defaultMethod == "cas" && !(req.session.appContext && (req.session.appContext.OTA || req.session.appContext.ERROR || req.session.appContext.TOKEN_AUTH))) {
		// This is a redirect after CAS login is successful. The redirect is done to remove ticket from URL.
		if(req.isAuthenticated()) {
			// If request is authenticated, render the App
			authController.renderApp(req, res);
		} else {
			// Redirect to CAS server for authentication
			authController.casAuthentication(req, res, next);
		}
	} 
	// Else Render Index/Login Page
	else {
		authController.renderApp(req,res);
	}
});

// Start Express server
var port = process.env.PORT || 8080;
var appserver = app.listen(port, function () {
  syslog.info('ComproDLS seed App started on port ' +  port + ". Build Mode: " + buildMode + ", Environment: " + appEnvironment);
});
