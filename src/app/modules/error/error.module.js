(function() {
  'use strict';

  var module = angular.module('app.error', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('error', {
        url: '/error',
        templateUrl: '/app/modules/error/views/error.html',
        controller : 'ErrorController'
      });
  }
})();
