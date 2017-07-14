(function() {
  'use strict';

  var module = angular.module('app.login', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: '/app/modules/login/views/login.html',
        controller: 'LoginController'
      });
  }
})();
