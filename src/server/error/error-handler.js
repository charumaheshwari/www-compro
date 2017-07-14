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
 
/*************************************
 * Application Error Handler
 **************************************/
'use strict';

//Get Application Logger
require('../libs/logging');

//Log runtime/uncaught exceptions
process.on('uncaughtException', function(err) {
    syslog.error("Uncaught Error, " + err.stack);
});

/************************************
* External npm Modules
************************************/
var fs = require('fs');
var sourceMap = require('source-map');
var path = require('path');
/************************************
* Internal npm Modules
************************************/
//Get App environment
var appEnvironment = require('../config/env').appEnv;
//Build Mode
var buildMode = process.env.DLS_UNCOMPRESSED_MODE ? "development" : "production";

if(buildMode == 'production'){
    var rawSourceMap;
    fs.readFile(path.join(__dirname,"./../../../dist/scripts/app.map"), "utf8", function(err,data){
        rawSourceMap = data;
    });
}
    
/************************************
* Module exports / Public functions
************************************/ 
exports.logError = logError;
exports.errorController = errorController;
exports.sdkErrorController = sdkErrorController;
exports.frontendErrorController = frontendErrorController;

/************************************
* Public function definitions
************************************/
//Generic function to log errors (Standard Bunyan formatted errors). Always use this function to log errors and avoid console logs.
function logError(err) {  
    syslog.error(createErrorString(err,'SERVER_ERROR'));    
};

// 
/***************
 * Generic Error controller. It logs error and sends the error response to frontend. 
 * Always use this function for handling errors and avoid handling errors individually.
 * 
 * options  
 *  hideErrorOnFrontend : If true, send 200 http code and prevents error popups on frontend. This is typically done when frontend services plan to handle specific errors themselves (instead of leveraging generic error hanlder)
 *  skipLoggingError: if true, dont log error. This is generally used for Unauthorized/Unauthenticated requests.
 *  statusCode: By default, errorController send 500 error code to frontend. If we want to send some other code, we can use this option.
 */
function errorController(req, res, err, options) {    
    var errorType = 'SERVER_ERROR';
    if (options && options.errorType) {
        if(!(errorType == "SERVER_ERROR_SDK" && err.type != "API_ERROR" && err.type != "SDK_ERROR")) {
            errorType = options.errorType;
        }      
    }  

    if(!Object.keys(err).length){
        syslog.error(err);
        err = err.toString();
    }

    if (!(options && options.skipLoggingError)) {
        //Log error  
        syslog.error(createErrorString(err, errorType, req)); 
    }

    //Send Error response to frontend
    if (options && options.hideErrorOnFrontend) {
       res.send(err); 
    } else {
       if (options && options.statusCode) {
            res.status(options.statusCode).send(err);
       } else {
            res.status(500).send(err);
       }
      
    }    
};

//Log frontend errors (Sent by Frontend)
function frontendErrorController(req,res){

    if(buildMode == 'production'){
        var fileDetails = req.body.fileDetails.substring(req.body.fileDetails.lastIndexOf('/') + 1).split(':'); 
        
        var smc = new sourceMap.SourceMapConsumer(rawSourceMap);
        var mappedFileDetails = smc.originalPositionFor({
            line: parseInt(fileDetails[1]),
            column: parseInt(fileDetails[2])
        });
        req.body.actualfileDetails =  mappedFileDetails.source + ':' + mappedFileDetails.line;    
    } 
        
    syslog.error(createErrorString(req.body,'JS_ERROR', req));        
    res.send(true);
 
};

/***************
 * Error controller specific to comproDLS SDK errors. It logs error and sends the error response to frontend. 
 * Always use this function for handling errors and avoid handling errors individually.
 * 
 * options  
 *  hideErrorOnFrontend : If true, send 200 http code and prevents error popups on frontend. This is typically done when frontend services plan to handle specific errors themselves (instead of leveraging generic error hanlder)
 *  skipLoggingError: if true, dont log error. This is generally used for Unauthorized/Unauthenticated requests.
 *  statusCode: By default, sdkErrorController extracts error code from SDK error response. If we want to use some other code, we can use this option.
 */
function sdkErrorController(req, res, err, options) {
    var errorOptions =  options || {};
    if (!(options && options.statusCode)) {
         errorOptions.statusCode = err['httpCode'];
    }
    errorOptions.errorType = 'SERVER_ERROR_SDK';
    errorController(req, res, err, errorOptions);    
};

/************************************
* Private function definitions
************************************/

// Create Error String 
function createErrorString(err, errorType, req) {
	var errorString = "" ;
	if(req) {
		if(appEnvironment != 'local'){
			var ipaddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress ;
			errorString = "Client IP address= " + ipaddress + ", ";
		}
		if(req.session) {
			errorString += "OrgId= " + req.session.orgid + ", UserId= " + req.session.userid + ", ";
		}
	}
	errorString += "Error Type= "+ errorType + ", Error= " + JSON.stringify(err);
	return errorString;
}
