(function() {
  'use strict';

  angular.module('app.error')
    .controller('ErrorController', errorController)
  ;

  errorController.$inject = ['$scope', '$state'];
  function errorController ($scope, $state) {
    $scope.error = {};
    if(DLS.APP.ERROR){
      $scope.error.message = DLS.APP.ERROR.message;
      $scope.error.description = DLS.APP.ERROR.description;
    }
  }

})();
