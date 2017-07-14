(function() {
  'use strict';

  var module = angular.module('app.seed-dashboard', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.seed-dashboard', {
        url: '/dashboard',
        templateUrl: '/app/modules/dashboard/views/dashboard.html',
        controller: 'DashboardController'
      });
  }
})();
