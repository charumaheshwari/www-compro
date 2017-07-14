(function() {
  'use strict';

  angular.module('app.home')
    .directive('popoverHtmlUnsafePopup', popoverHtmlUnsafePopup)
    .directive('popoverHtmlUnsafe', popoverHtmlUnsafe);
  
  popoverHtmlUnsafePopup.$inject = ['$tooltip', 'jQuery', '$timeout', '$state'];
  popoverHtmlUnsafe.$inject = ['$tooltip'];
  
  function popoverHtmlUnsafePopup($tooltip, jQuery, $timeout, $state){
    return {
            restrict: 'EA',
            replace: true,
            scope: { 
                title: '@', 
                content: '@', 
                placement: '@', 
                animation: '&', 
                isOpen: '&' 
            },
            templateUrl: '/app/modules/home/directives/popover-html-unsafe-popup.html'
        };
  }
 
  function popoverHtmlUnsafe($tooltip){
      return $tooltip('popoverHtmlUnsafe', 'popover', 'click');
  }
})();