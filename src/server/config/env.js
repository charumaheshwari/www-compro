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
 
'use strict';
//App Environment
var appEnv = process.env.APP_ENVIRONMENT || 'local';
//DLS Environment
var dlsEnv;
if(appEnv === 'local') {
	dlsEnv = process.env.DLS_ENV || 'staging1';
} else {
	dlsEnv = process.env.DLS_ENV || 'production';
} 

exports.appEnv = appEnv;
exports.dlsEnv = dlsEnv;
