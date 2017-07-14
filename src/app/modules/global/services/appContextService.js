(function() {
  'use strict';

    angular.module('app.global').factory('AppContextService', appContextService);

    appContextService.$inject = ['$http'];
    function appContextService($http) {
        function getAppContext() {
           return $http.get('/appcontext');
        }
        
        var factory = {
          getAppContext : getAppContext

        };
        return factory;       
    }
})();