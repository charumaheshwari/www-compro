(function() {
  'use strict';

    loginController.$inject = ['$scope', '$state', 'AuthService'];
    function loginController ($scope, $state, AuthService) {
        
        $scope.user = {};
        $scope.isLoginEnabled = true;
    	$scope.login = function (user) {
            $scope.errorMessage = '';
    	 	if(!user.orgid){
                $scope.errorMessage = 'Organisation is required';
            } else if(!user.username) {
                $scope.errorMessage = 'Username is required';
            } else if (!user.password) {
                 $scope.errorMessage = 'Password is required';
            } else{
                $scope.isLoginEnabled = false;
                AuthService.loginAuth(user.username, user.password, user.staySignIn, user.orgid).then(function(res) {
                    if (res.data.success === false) {
                        $scope.isLoginEnabled = true;
                        $scope.errorMessage = res.data.message;
                    } else {
                        $state.go('app.seed-dashboard');
                    }
                }, function(res) {
                        $scope.isLoginEnabled = true;
                        $scope.errorMessage = res.data.message;
                });
            }              
        };
    }

   
  angular.module('app.login').controller('LoginController', loginController);
})();