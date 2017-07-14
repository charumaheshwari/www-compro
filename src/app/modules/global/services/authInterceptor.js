
(function() {
  'use strict';

    angular.module('app.global').factory('AuthInterceptor', authInterceptor);
    authInterceptor.$inject = ['$window','$q', '$location'];

    function authInterceptor($window, $q, $location) {

        function request(config) {
            if (config.method === 'GET' && !isTimestampNeeded(config.url)) {
                var timestamp = new Date().getTime();
                if(config.url.indexOf('?') !== -1){
                    config.url += '&timestamp=' + timestamp;
                } else {
                    config.url += '?timestamp=' + timestamp; 
                }   
            }
            config.headers = config.headers || {};
            return config;
        }


        function responseError(response) {
            if (response.status === 401) {
                document.cookie = 'dls_config=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                $location.path('/login');
            } else {
                var errorContent = '<b>Message:</b> ' + response.statusText + '<br/> <b>URL:</b> ' + response.config.url + '<br/><b>Status:</b> ' + response.status;

                $window.Messenger.options = { extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right', theme: 'air' };
                $window.Messenger().post({
                    message: errorContent,
                    type: 'error',
                    showCloseButton: true,
                    hideAfter: false
                });
            }   
            return $q.reject(response);       
        }


        var factory = {
          request : request,
          responseError : responseError
        };
        return factory;    


        /************************************************************* 
         * Private functions definition
        **************************************************************/
        function isTimestampNeeded(url) {
            var isFile = url.substring(url.length - 5, url.length);
            if (isFile === '.html' || isFile === '.json') {
                return true;
            }
            return false;
        }   
    }
})();