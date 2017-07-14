(function() {
  'use strict';

  var module = angular.module('app.verify-auth', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('verify-auth', {
        url: '/verify',
        templateUrl: '/app/modules/verify-auth/views/verifyAuth.html',
        controller: 'VerifyAuthController'
      });
  }
})();
