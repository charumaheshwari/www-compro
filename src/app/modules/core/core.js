(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('App', AppController)
    .factory('jQuery', jQueryService);

  AppController.$inject = ['config', '$scope', '$rootScope', '$localStorage', '$state'];
  function AppController(config, $scope, $rootScope, $localStorage, $state) {
    /*jshint validthis: true */
    var vm = this;

    vm.title = config.appTitle;

    $scope.app = config;
    $scope.$state = $state;

    if (angular.isDefined($localStorage.state)){
      $scope.app.state = $localStorage.state;
    } else {
      $localStorage.state = $scope.app.state;
    }
    if(isQueryParamPresent('embed')){ // If Url contains embed query param
      $rootScope.embedMode = true; //Set embedMode to true if app is launched in embed mode.
    }

    $rootScope.returnUrl = getQueryParam('return_url');

    //Function to check if url contains specific query param
    function isQueryParamPresent(paramName) 
    {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0 ; i < vars.length ; i++) {
          var queryParam = vars[i].split('=');
          if(queryParam[0] === paramName || queryParam[0] === (paramName + '/')) { //If query param is present return true
            return true;
          }
        }
      return false; //If query param embed is not present in url return false
    }
    function getQueryParam(paramName) 
    {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0 ; i < vars.length ; i++) {
          var queryParam = vars[i].split('=');
          if(queryParam[0] === paramName) { //If query param is present return value
            return queryParam[1];
          }
        }
      return undefined;
    }

  }

  jQueryService.$inject = ['$window'];

  function jQueryService($window) {
    return $window.jQuery; // assumes jQuery has already been loaded on the page
  }

})();
