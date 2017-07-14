(function() {
  'use strict';

    verifyAuthController.$inject = ['$scope', 'AuthService', '$window','$location'];
    function verifyAuthController ($scope, AuthService, $window, $location) {
    	$scope.verification = {};
    	$scope.verification.answer;
        $scope.isVerifyEnabled = true;
    	/*jshint camelcase: false */
    	if(DLS.APP.OTA && DLS.APP.OTA.verification_question) {
    		$scope.verification.question = DLS.APP.OTA.verification_question ;
    	}
    	$scope.verify = function() {
            $scope.errorMessage = '';
            if(!$scope.verification.answer) {
                $scope.errorMessage = 'Verification answer is required';
            } else {
                $scope.isVerifyEnabled = false;
                AuthService.verifyUser(DLS.APP.OTA.encoded_key,$scope.verification.answer).then(function(res){
                    if (res.data.success === false) {
                        $scope.isVerifyEnabled = true;
                        $scope.errorMessage = res.data.error.message;
                    } else {
                        var uri = res.data.response.uri;
                        if(/^\/?#/.test(uri)){
                            uri = uri.replace(/\/?#/,'');
                            $location.path(uri); 
                        } else {
                            $window.location.href = uri;
                        }  
                    }
                });
                
            }		
    	};
        
    }

   
  angular.module('app.verify-auth').controller('VerifyAuthController', verifyAuthController);
})();