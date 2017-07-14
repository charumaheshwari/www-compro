(function() {
  'use strict';

    function cookieService() {
        
        function getCookie(cookieName){
            var cookies = {};
            
            var pairs = document.cookie.split('; ');
            
            for (var i=0; i<pairs.length; i++){
              var pair = pairs[i].split('=');
              /*jshint nonstandard:true */
              cookies[pair[0]] = unescape(pair[1]);
            }
            
            return cookies[cookieName];
        }

        function getAuthCookieJSON(){   
          var dlsConfigCookie = getCookie('dls_config');
          if (dlsConfigCookie){
              return JSON.parse(dlsConfigCookie);
          }else{
              return undefined;
          }
        } 
        var factory = {
          getAuthCookieJSON : getAuthCookieJSON
        };
        return factory;
    }

    angular.module('app.global').factory('CookieService', cookieService);

})();