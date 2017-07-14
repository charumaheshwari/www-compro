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
 * Provides session utility functions to be used across App
 ***********************************************************************/ 
'use strict';

/************************************
 * Module exports / Public functions
 ************************************/
exports.getTokenFromSession = getTokenFromSession;

/*********************************
 * Public Function Definitions
 *********************************/
//Function to get comproDLS token Object from session
function getTokenFromSession(req) {
   var token = {
            "access_token" : req.session.accessToken, //Access token
            "expires_in" : req.session.expiresIn, //Token expiry time, token gets expired after this time
            "refresh_token": req.session.refreshToken
   };
   return token; 
}