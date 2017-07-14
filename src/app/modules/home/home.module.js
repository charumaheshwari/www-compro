(function() {
  'use strict';

  var module = angular.module('app.home', [
    'ui.router',
     'ui.jq',
     'slickCarousel'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.home', {
        url: '/home',
        templateUrl: '/app/modules/home/views/home.html',
        controller: 'HomeController',
        params : {
            page : 'Home'
        }
      });
  }
})();
