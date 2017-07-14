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
 * Provides request utility functions to be used across App
 ***********************************************************************/
'use strict'; 

/************************************
 * Module exports / Public functions
 ************************************/
exports.isHttps = isHttps;
exports.getQueryParamsString = getQueryParamsString;
exports.getParamsExceptTicket = getParamsExceptTicket;
exports.getRequestProtocol = getRequestProtocol;

/*********************************
 * Public Function Definitions
 *********************************/
// Function to check if request protocol is https
function isHttps (req) {   
    /*******
     *  We can't use req.protocol for detecting https requests on heroku as heroku load balancer changes the protocol before forwarding request to actual node server .
     *  Instead we need to check "x-forwarded-proto" header for detecting https requests on heroku
     *******/ 
    if (req.headers['x-forwarded-proto']) {
        if ( req.headers['x-forwarded-proto'] == 'https') {
            return true;
        }
    } else {
        if (req.protocol == 'https') {
            return true;
        } 
    }
    return false;    
}

//Function to get Query params as String (By default req.query returns an Array)
function getQueryParamsString(req){
    var queryParamsString = '';
    if(req.query){
        for(var queryparam in req.query){
          if(queryparam != 'token' && queryparam != 'orgid' && queryparam != "launch_url") {
            if(queryParamsString != ''){
              queryParamsString += '&'+ queryparam ; 
            } else{
              queryParamsString += '?'+ queryparam ; 
            } 
            if(req.query[queryparam]){
              queryParamsString += '=' + req.query[queryparam];
            } 
          }                     
        }
    } 
    return queryParamsString;
}

/***
 * Util function to get Query params(except ticket param). 
 **/
function getParamsExceptTicket (req){
    var queryParams = "";
    if(req.query){
        for(var queryparams in req.query){
            if(queryparams != "ticket"){ 
                if(queryParams != ""){
                   queryParams += '&'+ queryparams ; 
                }else{
                   queryParams += '?'+ queryparams ; 
                } 
                if(req.query[queryparams]){
                    queryParams += '=' + req.query[queryparams];
                }               
            }            
        }
    } 
    return queryParams;
}

// Function to get request protocol on heroku
function getRequestProtocol (req) {   
    var requestProtocol =  (isHttps(req) ? "https" : "http");    
    return requestProtocol;
}
