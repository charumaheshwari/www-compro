(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('LayoutController', layoutController);

  layoutController.$inject = ['$rootScope', 'CookieService', '$scope', '$window', 'AnchorSmoothScroll'];
  function layoutController($rootScope, CookieService, $scope, $window, AnchorSmoothScroll) {

     $scope.gotoSection = function($event, sectionId) {
          jQuery('.main-nav li.active').removeClass('active');
          jQuery($event.target).parent().addClass('active');
          AnchorSmoothScroll.scrollTo(sectionId);
          if(jQuery( '.navbar-toggle:visible' )){
            jQuery('#login-navigation').collapse('hide');
          }
      };
     /** ----------------------------------------------------------
        * ON WINDOW SCROLL
        * ----------------------------------------------------------*/
      jQuery(document).scroll(function(e) {
         var scrollTop = jQuery(document).scrollTop();
         if(scrollTop >= 60){
            jQuery('.navbar').addClass('affix');
            jQuery('.scrollToTop').show();
         } else {
            jQuery('.navbar').removeClass('affix');
            jQuery('.scrollToTop').hide();
         }
      });
  }


})();
