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

 /**********************************************************************
 * Provides functions for user authentication. Following autheentication methods are supported
 * 1. Local / Login Form
 * 2. CAS Authentication - Redirects to third party CAS server
 * 3. One time Auth URLs 
 * 4. Token (request query param) Authentication 
 ***********************************************************************/
'use strict';


/************************************
* Internal npm Modules
************************************/
// App Config
var config = require('../config');
//Get App environment
var appEnv = require('../config/env').appEnv;
//Get DLS environment
var dlsEnv = require('../config/env').dlsEnv;
//Request Utilities
var reqUtils = require('../libs/request-utils');
//Redis Connector
var redis = require('../libs/redis');
// Error Handler
var errorHandler = require('../error/error-handler');
//var cas = require('module-app-sso').cas;

/************************************
* External npm Modules
************************************/
// comproDLS SDK
var comproDLS = require('comprodls-sdk').init(dlsEnv);
var q = require('q');
var extend = require('extend');

/************************************
* Private Variables
************************************/
//Auth Cookie name (Contains user and org info)
var authCookieName = "dls_config";

/************************************
* Module exports / Public functions
************************************/ 
exports.localLogin = localLogin;
exports.logout = logout;
exports.otaStep1 = otaStep1;
exports.otaStep2 = otaStep2;
exports.isAuthenticated = isAuthenticated;
exports.tokenAuthentication = tokenAuthentication;
//exports.casAuthentication = casAuthentication;
exports.renderApp = renderApp;

/************************************
* Public function definitions
************************************/
//Authenticate Login Request

//Authenticate Login Request
function localLogin(req, res, next) {
  
  //Get credentials from request
  var username = req.body["username"];
  var orgid = req.body["orgid"];
  var password = req.body["password"];

    //Authenticate with comproDLS SDK
  comproDLS.authWithCredentials(orgid, {username: username, password: password}, {})
  .then(authSuccess)
  .catch(authFailure);  

  function authSuccess(response) {  
      //Create user object to store/serialize in session
      var user = {};
      user['username'] = username;     
      user['userid'] = response['user']['uuid'];
      user['name'] = response['user']['name'];      
      user['orgid']= orgid; 
      user['expires_in'] = response['token']['expires_in'];
      user['access_token'] = response['token']['access_token'];
      user['refresh_token'] = response['token']['refresh_token'];
      if(response.user.roles.admin){
          user.role_primary = "admin"
      } else if(response.user.roles.teacher){
          user.role_primary = "teacher"
      } else if(response.user.roles.student){
          user.role_primary = "student"
      }

      // If the role of user is not allowed , send errorresponse
      if(config.app.authentication.allowedUserRoles.indexOf(user.role_primary) == -1) {          
        errorHandler.errorController(req, res, {
                success:false, 
                message: 'Unauthorized: Role ' + user.role_primary + ' is not allowed access'
            }, {
                hideErrorOnFrontend: true, 
                skipLoggingError: true
            });
      } else {
        
        passportLogin(req,res,user)
        .then(passportLoginSuccess)
        .catch(passportLoginError);

        function passportLoginSuccess(){
            // Set Auth method in session
            req.session.appContext = { 'AUTH_METHOD' : 'login'};
            //Delete token from user object (to be sent in response) for security
            delete user.expires_in;
            delete user.access_token;
            delete user.refresh_token;
   
            //Send success response      
            res.status(200).send({success:true,user:user});
        }
        function passportLoginError(err){
            errorHandler.errorController(req, res, {success:false, message:'Internal server error', err : err}, {hideErrorOnFrontend: true});
        }
      } 

  }

  function authFailure(err) {   
      var skipLoggingError = false;
      // Dont log error for Invalid credentials. Log all other errors
      if (err.httpcode >= "400" && err.httpcode < "500") {
          skipLoggingError = true;
      }
      var errorObject = {
        success: false, 
        status: err.httpcode || '', 
        message: err.message || ''
      };
      errorHandler.sdkErrorController(req, res, errorObject, {hideErrorOnFrontend: true, skipLoggingError: skipLoggingError});      
  }
}

//Handle user logout request
function logout(req, res){  
  //Passport logout and destroy session (and browser cookie)
  req.logout();
  req.session.destroy(function(){
      //Clear auth cookie (which was set manually)
      var authcookieConfig = {};
      if (config.app.authentication.defaultMethod == "local" && config.app.authentication.local.cookieSsoEnabled) {
        authcookieConfig.domain = config.app.authentication.local.cookieDomain;
      }
      res.clearCookie(authCookieName, authcookieConfig);      
      //Return success response
      return res.status(200).send({success:true})
  });
}

//Handle the first step One time authentication (used for getting Verification Question using encoded Key)
function otaStep1(req, res){
    var appContext = {};
    getOTAUrlVerificationQuestion()
    .then(getOTAUrlVerificationQuestionSuccess)   
    .catch(errorCatcher);

    //Get OTAUrlVerificationQuestion 
    function getOTAUrlVerificationQuestion() {
        var auth = comproDLS.Auth();
        return auth.getOTAUrlVerificationQuestion({orgid : config.app.authentication.otaOrgid , encoded_key: req.params.encodedKey});
    } 

    //Get OTAUrlVerificationQuestion success handler
    function getOTAUrlVerificationQuestionSuccess(response) {
        //Used to store app context to be stored in index.hbs
        appContext.AUTH_METHOD = "OTA"; 
        appContext.OTA = response;
        appContext.OTA.encoded_key = req.params.encodedKey; 
        //redirect the app 
        redirectApp(req,res,appContext)
    }
 
    //Catch errors
    function errorCatcher(err) {
        appContext.ERROR = { message : "Invalid URL" , description : "The URL does not exist. You may have mistyped the URL, or it may no longer be available. Please check the URL in the address bar and try again."};
        redirectApp(req,res,appContext)
    }
}

/*Handle the second step One time authentication 
* (used to  get user info (token, roles, uuid etc) 
* and other data (uri,host, params orgid etc) 
* using verification answer and encoded key */

function otaStep2(req,res) {
  getTokenFromOTAUrl()
  .then(getTokenFromOTAUrlSuccess)
  .catch(errorCatcher);

    //Get getTokenFromOTAUrl
    function getTokenFromOTAUrl(){
        var auth = comproDLS.Auth();
        return auth.getTokenFromOTAUrl({orgid : config.app.authentication.otaOrgid , encoded_key : req.body['encoded_key'], verification_answer : req.body['verification_answer']});
    }

    //Get TokenFromOTAUrlSuccess success handler
    function getTokenFromOTAUrlSuccess(response){

        var userRole = response.target_user.roles[0] ;

        // If the role of user is not allowed , send errorresponse
        if(config.app.authentication.allowedUserRoles.indexOf(userRole) == -1){
            return errorHandler.errorController(req, res, {
                success:false, 
                message: 'Unauthorized: Role ' + user.role_primary + ' is not allowed access'
            }, {
                hideErrorOnFrontend: true, 
                skipLoggingError: true
            });            
        } else {

            //Create user object to store/serialize in session
            var user = {};
            user['username'] = response.target_user.name;     
            user['userid'] = response.target_user.uuid;
            user['name'] = response.target_user.name;    
            user['orgid']= config.app.authentication.otaOrgid; 
            user['expires_in'] = response.target_user.expires_in;
            user['access_token'] = response.target_user.access_token;
            user['refresh_token'] = response.target_user.refresh_token;        
            user['role_primary'] = userRole;  

            passportLogin(req, res, user)
            .then(passportLoginSuccess)
            .catch(passportLoginError);

            function passportLoginSuccess(){
              return res.status(200).send({success:true, response:response});
            }
            function passportLoginError(err){
              errorHandler.errorController(req, res, {success:false, message:'Internal server error', err : err}, {hideErrorOnFrontend : true});
            }
        }
    }

    //Catch errors
    function errorCatcher(err) {
      var skipLoggingError = false;
      // Dont log error for Invalid credentials. Log all other errors
      if (err.httpcode >= "400" && err.httpcode < "500") {
          skipLoggingError = true;
      }
      errorHandler.sdkErrorController(req, res, {success:false, error : err}, {hideErrorOnFrontend : true, skipLoggingError: skipLoggingError});        
    }
}

function isAuthenticated (req, res, next) {
    if (!req.isAuthenticated()) {
        var errorMessage = "AUTHORIZATION-ERROR: Unauthorized request, Request Path=" + req.path;
        if(!redis.redisConnected()){
            errorMessage = "AUTHORIZATION-ERROR: Redis Unavailable, Request Path=" + req.path;
        }
        errorHandler.errorController(req, res, {"message":"Unauthorized"} , {statusCode : 401});
    } else {
        next();
    }    
}

//Authenticate using token present in url (as query param)
function tokenAuthentication(req, res) {
    var appContext = {};
    try {
      //Get Access token from query
      var token = JSON.parse(new Buffer(req.query.token, 'base64').toString('ascii')); 
    } catch(ex){
      appContext.ERROR = { message : "Invalid Token or Orgid" , description : "The token or orgid is not valid. Please try again with valid inputs."};
      redirectApp(req,res,appContext);
    }
    
   
    //Get OrgID from query
    var orgid = req.query.orgid;

    comproDLS.authWithToken(orgid, token , {})
    .then(authSuccess)
    .then(getUserProfile)
    .catch(errorCatcher);

    //Auth success handler
    function authSuccess(success) {
        var auth = comproDLS.Auth();
        return auth.getUserProfile({metrics: true});    
    }
    //User profile success handler
    function getUserProfile(response) {
      var userRole;
      if(response.roles.admin){
        userRole = 'admin';
      } else if(response.roles.teacher){
        userRole = 'teacher';
      } else if(response.roles.student){
        userRole = 'student';
      }
      // If the role of user is not allowed , send errorresponse
      if(config.app.authentication.allowedUserRoles.indexOf(userRole) == -1){
        appContext.ERROR = { message : "Not Authorized" , description : "User with " + userRole + " role does not have permissions to view this content. If you believe this is an error, please contact your system administrator."};
        redirectApp(req,res,appContext);

      } else {
        //Create user object to store/serialize in session
        var user = {};
        user['username'] = response['username'];     
        user['userid'] = response['uuid'];
        user['name'] = response['name'];      
        user['orgid']= response['org']['id'];
        user['access_token'] = token['access_token'];
        user['expires_in'] = token['expires_in'];
        user['refresh_token'] = token['refresh_token']; 
        user['role_primary'] = userRole;

        passportLogin(req, res, user)
        .then(passportLoginSuccess)
        .catch(passportLoginError);

        function passportLoginSuccess(){
          //Used to store app context to be stored in index.hbs
          appContext.AUTH_METHOD = 'tokenAuth'; 
          appContext.TOKEN_AUTH = {'launchUrl' : req.query.launch_url};         
          //Redirect App     
          redirectApp(req, res, appContext);
        }
        function passportLoginError(err){
          appContext.ERROR = { message : "Internal server error" , description : err};
          redirectApp(req,res,appContext); 
        }
      }  
         
    }
    //Catch errors
    function errorCatcher(err) {
      appContext.ERROR = { message : "Invalid Token or Orgid" , description : "The token or orgid is not valid. Please try again with valid inputs."};
      redirectApp(req,res,appContext);
    }
}

// CAS authentication
function casAuthentication(req, res, next) {
    //Get all query params except ticket
    var queryParams = reqUtils.getParamsExceptTicket(req);
    var serviceURL = reqUtils.getRequestProtocol(req) + '://' + req.headers.host + req.path + queryParams; 
    var casOptions = {
        "serviceURL" : serviceURL,
        "casLoginURL" : config.app.authentication.cas.loginURL,
        "casServiceValidateURL" : config.app.authentication.cas.serviceValidateURL,
    }
    if (req.query && (req.query.ticket != undefined)) {
        cas.validateTicket(req, res, casOptions).then(function(validateTicketResponse){  

          var extraAttributes = validateTicketResponse["extraAttributes"];
          var appContext;

          if(dlsEnv == extraAttributes["cas:org_environment"][0] ) {
            
            var roles = JSON.parse(extraAttributes["cas:roles"][0]);
            var user = {        
                "userid" : validateTicketResponse["userId"],
                "username" : extraAttributes["cas:username"][0],
                "orgid": extraAttributes["cas:org"][0],
                "expires_in": extraAttributes['cas:expires_in'][0],
                "access_token" : extraAttributes['cas:access_token'][0],
                "refresh_token": extraAttributes['cas:refresh_token'][0],
                "name":extraAttributes["cas:username"][0]
            }

            if(roles.admin){
                user.role_primary = "admin"
            } else if(roles.teacher){
                user.role_primary = "teacher"
            } else if(roles.student){
                user.role_primary = "student"
            }
            //Login and create express session
            passportLogin(req,res,user)
            .then(passportLoginSuccess)
            .catch(passportLoginError);

            function passportLoginSuccess(){
              // Used to set Auth method in session
              appContext = { 'AUTH_METHOD' : 'cas'};
              //This is a redirect after CAS login is successful. The redirect is done to remove ticket from URL.      
              stripOffTicketAndRedirect(req, res, appContext); 
            }
            function passportLoginError(err){
              appContext = {
                ERROR : {  message : "Internal server error" , description : err }
              }
              stripOffTicketAndRedirect(req, res, appContext); 
            }
          } else {
            appContext = {
              ERROR : {  message : "Invalid Organisation" , description : "This application is not configured to work with " + extraAttributes["cas:org"][0] + " organisation. Please try again with a different organisation."
              }
            }
            stripOffTicketAndRedirect(req, res, appContext); 
          }
 
        }, function(err) {
            var appContext = {
              ERROR : { message : "Unexpected Error" , 
              description : "We are unable to complete your request due to an unexpected error. Please try again after some time by refreshing and/or clearing your browser's cache and cookies. If the problem persists, please contact your system administrator."
              } 
            };
            stripOffTicketAndRedirect(req, res, appContext); 
        });            
    } else {           
        cas.login(req, res, casOptions);    
    }     
}
/************************************
* Private function definitions
************************************/
//Function to redirect the app
function redirectApp(req, res, appContext){
    if(appContext){
      req.session.appContext = appContext;
    } 
    var url = reqUtils.getRequestProtocol(req) + '://'+ req.headers.host + reqUtils.getQueryParamsString(req);
    res.redirect(url);
}
//Function to strip off the ticket param and redirect the app
function stripOffTicketAndRedirect(req, res, appContext) {
    if(appContext){
      req.session.appContext = appContext;
    } 
    var url = reqUtils.getRequestProtocol(req) + '://'+ req.headers.host + reqUtils.getParamsExceptTicket(req) + "/";
    res.redirect(url);
}
// Function to render the APP
function renderApp(req,res){
    var appContext = {};	
    // If this is redirect from OTA Authentication, OTA ERROR, TOKEN Authentication - Remove unwanted session variables
    if(req.session.appContext) {
        extend(true, appContext, req.session.appContext);
        if(req.session.appContext.OTA) {
            delete req.session.appContext.OTA;
        } else if(req.session.appContext.ERROR) {
            delete req.session.appContext.ERROR;
        } else if (req.session.appContext.TOKEN_AUTH) {
            delete req.session.appContext.TOKEN_AUTH;
        }		
    }
    appContext.DLS_ENV = dlsEnv;
    //Disable caching (browser and proxies) for this view
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render('index.hbs', {appContext: JSON.stringify(appContext)})
}

// Passport Login
function passportLogin(req,res,user){
  //Passport Login
  var deferred = q.defer();
  req.logIn(user, function(err) {            
      //If error logging in passport, send error response
      if (err) {
        deferred.reject(err);
      }
      //Store orgid and token in session
      req.session.orgid = user['orgid']
      req.session.expiresIn = user['expires_in'];
      req.session.accessToken = user['access_token'];
      req.session.refreshToken = user['refresh_token'];
      req.session.userid = user['userid'];

      //Create additional Auth cookie to store user and org data
      var authcookieConfig = {};
      var authCookieJSON = {
        "userid":user.userid,
        "orgid":req.session.orgid,
        "role" : user.role_primary
      }
      if(config.app.authentication.defaultMethod != "cas") {
        authCookieJSON.sso = false;
      }
      if (req.body.staySignedIn) {
        //Setting cookie age to 7 days (if stay signed is checked)
        req.session.cookie.maxAge = config.app.session.staySignInAge;
        authcookieConfig.maxAge = config.app.session.staySignInAge;
      }
      if (config.app.authentication.defaultMethod == "local" && config.app.authentication.local.cookieSsoEnabled) {            
        authCookieJSON.sso = true;            
        authCookieJSON.env = appEnv;
        authcookieConfig.domain = config.app.authentication.local.cookieDomain;
        
      }

      res.cookie(authCookieName,JSON.stringify(authCookieJSON), authcookieConfig);
      deferred.resolve();
  });
  return deferred.promise;
}


