angular.module('App', []).controller('Ctrl', function ($scope, $http, $timeout) {
    'use strict';

    function init() {
        var autoLogin = false;
        try {
            if(localStorage && localStorage.th_autologin_email) {
                $scope.emailAddress = localStorage.th_autologin_email;
                autoLogin = true;
            }
        } catch(err) {
        }
        if(autoLogin) {
            $timeout(function () { $scope.loginWithEmail(); }); //To have page init be done before we try to autologin. Avoids having to deal with things like emailLoginForm being null.
        }
    }

    $scope.hasLoginBeenClicked = false;
    $scope.loginWithEmail = function (evt) {
        if(evt) {
            evt.preventDefault();
        }

        $scope.hasLoginBeenClicked = true;

        if($scope.emailLoginForm.$invalid) {
            return;
        }

        $scope.isLoading = true;

        $http.post('/api/login2/authenticate', { email : $scope.emailAddress }).success(function (result) {
            $scope.isLoading = false;
            if(result.errMsg) {
                console.log(result.errMsg); //TODO: How to present to user
            } else if(result.url) {
                document.location =  result.url;
            } else if (result.isNewUser) {
                $scope.isNewUser = true;
            } else {
                $scope.isReturningUser = true;
            }
        });
    };

    $scope.isEmailInvalidShown = function () {
        if(!$scope.hasLoginBeenClicked) {
            return false;
        }
        return $scope.emailLoginForm.emailAddress.$invalid;
    };

    init();
});
