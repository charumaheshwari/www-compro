
(function() {
  'use strict';

    angular.module('app.home')
    .factory('HomeService', HomeService);
    
    HomeService.$inject = ['$http'];

    function HomeService($http) {
        
        var factory = {
          contact : contact
        };
        
        function contact(user) {
            //returning promise
            return $http.post('/api/contact',user);
        }
        
        return factory;    
    }
})();