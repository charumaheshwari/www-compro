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
 
/********************************************************************
 * local environment configuration. 
 * This is base configuration and other environments override this.
 ********************************************************************/
'use strict';

var config = {        
    "app" : {
        //Redirect to Https.
        //REDIRECT_TO_HTTPS environment variable (if set) will take precedence
        "redirectToHttps" : false,

        // User Session related properties
        "session" : {
            // Secret for encrypting session cookie
            "cookie-secret": "compro123",
            //Max age of Stay SignIn cookie (7 days)
            "staySignInAge": 604800000, 
            // Redis URLs and Credentials
            // This is used to store user sessions on backend
            "redis" : {
                // Redis URL
                // REDISCLOUD_URL environment variable (if set) will take precedence
                "url": "redis://compro:comprodls@pub-redis-17865.us-east-1-4.6.ec2.redislabs.com:17865"
            }
        },

        // Authentication related propeties
        "authentication" : {         

            // Authentication Method. Allowed values are "cas" and "local"
            // DEFAULT_AUTHENTICATION_METHOD environment variable (if set) will take precedence
            "defaultMethod" : process.env.DEFAULT_AUTHENTICATION_METHOD || "local",    

            // Local Authentication
            // App handles authentication itself using a login Page)
            "local" : {
                //To enable cookie-based single sign on 
                "cookieSsoEnabled": false,
                //Domain to use for storing cookies
                "cookieDomain" : ".comprodls.com",
            },

            // CAS Authentication 
            // App Redirects to a Centralised CAS server for authentication
            "cas" : {
                // CAS login url
                "loginURL" : "https://one.comprodls.com/",
                // CAS service validate url
                "serviceValidateURL" : "https://sso.comprodls.com/p3/serviceValidate"

            },

             // Allowed user roles. For all other user roles a 401 Not authorized message will be shown
            "allowedUserRoles" : ['student','teacher','admin'],

             // Org id used for One time authentication Method
             "otaOrgid" : "cdev1",
        }
    }            
}

module.exports = config;
