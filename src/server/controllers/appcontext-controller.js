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
 * Provides functions for app information
 ***********************************************************************/
'use strict';

/************************************
* Internal npm Modules
************************************/
//Session Utilities
var sessionUtils = require('../libs/session-utils');
//Application error handler
var errorHandler = require('../error/error-handler')
//Get DLS environment
var dlsEnv = require('../config/env').dlsEnv;
/************************************
* External npm Modules
************************************/
var comproDLS = require('comprodls-sdk').init(dlsEnv);


/************************************
* Module exports / Public functions
************************************/
exports.getAppContext = getAppContext;

/************************************
* Public function definitions
************************************/

//Function to get app context (user info and auth method) 
function getAppContext (req,res) {
    //Get user DLS token stored in session
    var token = sessionUtils.getTokenFromSession(req);
    //Get OrgID from session
    var orgid = req.session.orgid;

    comproDLS.authWithToken(orgid, token , {})
    .then(authSuccess)
    .then(getUserProfileSucces)
    .catch(errorCatcher);

    //Auth success handler
    function authSuccess(success) {
        var auth = comproDLS.Auth();
        return auth.getUserProfile({metrics: true});  
    }
    
    //User profile success handler
    function getUserProfileSucces(response) {
        var appContext = {};
        appContext.user = response;
        if(req.session.appContext) {
            appContext.authMethod = req.session.appContext.AUTH_METHOD;   
        }  
        res.send(appContext);        
    }

    //Catch errors
    function errorCatcher(err) {
        errorHandler.sdkErrorController(req, res, err); 
    }
}