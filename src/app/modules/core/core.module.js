(function() {
  'use strict';

  var core = angular.module('app.core', [
    'app.core.utils',
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'ngStorage',
    'duScroll'
  ]);

  core.config(appConfig);
  core.run(appRun);

  appConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$provide', '$httpProvider'];
  appRun.$inject = ['$rootScope', '$state', '$window', '$location', 'CookieService','ErrorFactory','jQuery'];

  function appConfig($stateProvider, $urlRouterProvider, $provide, $httpProvider) {
      $httpProvider.interceptors.push('AuthInterceptor');
      $stateProvider
          .state('app', {
              url: '/app',
              abstract: true,
              templateUrl: '/app/modules/core/app.html',
              controller: 'LayoutController'
          });

      $urlRouterProvider.otherwise(function ($injector) {
          var $state = $injector.get('$state');
          var $location = $injector.get('$location');
          if(DLS.APP.ERROR) {
            $state.go('error');
          } else if(DLS.APP.OTA) {
            $state.go('verify-auth');
          } else if(DLS.APP.TOKEN_AUTH && DLS.APP.TOKEN_AUTH.launchUrl) {
            var uri = DLS.APP.TOKEN_AUTH.launchUrl;
            if(/^\/?#/.test(uri)){
              uri = uri.replace(/\/?#/,'');             
            } 
            $location.path(uri);
          } else {
            $state.go('app.home');
          }     
      });

      $provide.decorator('$exceptionHandler', function($delegate, $injector) {
          return function(exception, cause) {
              var ErrorFactory = $injector.get('ErrorFactory');
              var $window = $injector.get('$window');
              var $location = $injector.get('$location');
              var regExp = /\(([^)]+)\)/;
              var content = '';
              var fileDetails = exception.stack.split('\n')[1];
              if(regExp.exec(fileDetails) !== null){
                fileDetails = regExp.exec(fileDetails)[0];
              }
              fileDetails = fileDetails.replace(/[{()}]/g, '');
              content += '<b>Message:</b> ' + exception + '<br/><b>File:</b> ' + fileDetails;
              $delegate(exception, cause);

              $window.Messenger.options = { extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right', theme: 'air' };
              $window.Messenger().post({
                message: content,
                type: 'error',
                showCloseButton: true,
                hideAfter: false
              });

              var errObj = {};
              errObj.msg = exception.message;
              errObj.fileDetails = fileDetails;
              errObj.url = $location.absUrl();
              ErrorFactory.createErrorObject(errObj);
          };
      });
  }

  function appRun($rootScope,$state, $window, $location, CookieService, ErrorFactory, jQuery) { 
    jQuery('body').addClass('loaded');
    $window.onerror = errorFunction;

    function errorFunction(msg, file, line,colno,err) {          
      var errObj = {};
      var errorContent = '<b>Message:</b> ' + msg + '<br/> <b>File:</b> ' + file + '<br/><b>Line:</b> '+ line;
      $window.Messenger.options = { extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right', theme: 'air' };
      $window.Messenger().post({
        message: errorContent,
        type: 'error',
        showCloseButton: true,
        hideAfter: false
      });
      errObj.msg = msg;
      errObj.fileDetails = file;
      errObj.lineNo = line;
      errObj.errorStack = err;
      errObj.url = $location.absUrl();
      ErrorFactory.createErrorObject(errObj);
    }      
  }

                   
})();
