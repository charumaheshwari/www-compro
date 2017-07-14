(function() {
  'use strict';

  angular.module('app.home')
    .controller('HomeController', HomeController);
  
  HomeController.$inject = ['jQuery','$window',  '$scope', '$location', '$timeout', '$rootScope', '$state'];
    
  function HomeController (jQuery, $window, $scope, $location, $timeout, $rootScope, $state) {
      
      /************************************************************* 
         * Scope variables
         **************************************************************/
      setTimeout(function(){
          jQuery('.products-carousel').slick({
              dots: true,
              infinite: true,
              speed: 500,
              autoplay: true,
              slidesToShow: 1,
              slidesToScroll: 1
        });
      }, 0);

      setTimeout(function() {
          jQuery('.clients-carousel').slick({
              speed: 500,
              autoplay: false,
              slidesToShow: 6,
              slidesToScroll: 6
        });
      }, 0);

      setTimeout(function() {
          jQuery('.testimonial-carousel').slick({
              dots: true,
              infinite: true,
              speed: 500,
              autoplay: true,
              slidesToShow: 1,
              slidesToScroll: 1
        });
      }, 0);

  }

})();
