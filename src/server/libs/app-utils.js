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
 * Provides utility functions to be used across App
 ***********************************************************************/
'use strict';

/************************************
 * Module exports / Public functions
 ************************************/
exports.redirectToHttps = redirectToHttps;

/************************************
* Internal npm Modules
************************************/
//Application config
var config = require('../config');

/*********************************
 * Public Function Definitions
 *********************************/
function redirectToHttps() {
     // If REDIRECT_TO_HTTPS Environment variable is present, use this.
     // Else fallback to config        
    if (process.env.REDIRECT_TO_HTTPS != undefined) { 
        //Checks for both Boolean and String types
        if (typeof process.env.REDIRECT_TO_HTTPS === "string" && process.env.REDIRECT_TO_HTTPS == "true") {            
            return true;
        } else if (typeof process.env.REDIRECT_TO_HTTPS === "boolean" && process.env.REDIRECT_TO_HTTPS) {             
            return true;
        } else {            
            return false;
        }    
    } else {         
        return config.app.redirectToHttps;
    }
}