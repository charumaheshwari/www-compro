(function() {
  'use strict';
    angular.module('app.global').factory('ErrorFactory', errorService);

    errorService.$inject = ['$q', '$http'];
    
    function errorService($q, $http) {

        function sendError(errObject){            
            var defer = $q.defer();        
            $http.post('error/javascript',errObject).then(function(response){
                defer.resolve(response);
            });                                                      
            return  defer.promise;
        } 

        function createErrorObject(err){   
          var errorObject = {};

          if(err.msg){
              errorObject.message = err.msg;
          }
          if(err.lineNo){
              errorObject.lineNo = err.lineNo;    
          }
          if(err.fileDetails){
              errorObject.fileDetails = err.fileDetails;
          }
          if(err.errorStack){
              errorObject.errorStack = err.stack;
          }
          if(err.url){
              errorObject.url = err.url;    
          }
          sendError(errorObject); 
        }  
        var factory = {
          createErrorObject : createErrorObject
        };
        return factory;
    }


})();
