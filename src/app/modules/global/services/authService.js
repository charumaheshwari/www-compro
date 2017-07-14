(function() {
  'use strict';

    angular.module('app.global').factory('AuthService', authService);

    authService.$inject = ['$http'];
    function authService($http) {
        function loginAuth(un, pwd, rem, orgid) {
          return $http.post('/auth/login', {
            username: un,
            password: pwd,
            staySignedIn: rem,
            orgid: orgid
          });
        }
        function logout() {
          return $http.get('/auth/logout');
        }
        function verifyUser(encodedKey, verificationAnswer ) {
          return $http.post('/auth/verify',{'encoded_key': encodedKey ,'verification_answer': verificationAnswer });
        }
        var factory = {
          loginAuth : loginAuth,
          logout : logout,
          verifyUser : verifyUser
        };
        return factory;       
    }
})();