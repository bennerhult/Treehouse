angular.module('App', []).controller('Ctrl', function ($scope, $http, $timeout) {
    'use strict';

    function init() {
        FB.init({
            appId: '480961688595420',
            status: true,
            cookie: true,
            xfbml: true,
            channelUrl : '//www.treehouse.io/channel.html',  //increases performance
            oauth: true
        })

        $scope.isiPad = navigator.userAgent.match(/iPad/i) != null;
        $scope.isiPhone = navigator.userAgent.match(/iPhone/i) != null;
        $scope.isiOs = $scope.isiPad || $scope.isiPhone
        if (("standalone" in window.navigator) && window.navigator.standalone){
            $scope.isAppMode = true
        }

        var autoSignin = false;
        try {
            if(localStorage && localStorage.th_autosignin_email) {
                $scope.emailAddress = localStorage.th_autosignin_email;
                autoSignin = true;
            }
        } catch(err) {
        }
        if(autoSignin) {
            $timeout(function () { $scope.signinWithEmail(); }); //To have page init be done before we try to autosignin. Avoids having to deal with things like emailSigninForm being null.
        }
    }

    $scope.signinWithEmail = function (evt) {
        if(evt) {
            evt.preventDefault();
        }
        if($scope.emailSigninForm.$invalid) {
           if($scope.emailSigninForm.emailAddress.$error.email) {
               $scope.nothingEntered = false;
               $scope.isEmailInvalid = true;
            } else {
               $scope.isEmailInvalid = false;
               $scope.nothingEntered = true;
             }
            return;
        }

        $scope.authenticationFailure = false;
        $scope.isLoading = true;

        $http.post('/api/signin/authenticate', { email : $scope.emailAddress }).success(function (result) {
            $scope.isLoading = false;
            if(result.errMsg) {
                $scope.authenticationFailure = true;
            } else if(result.url) {
                document.location =  result.url;
            } else if (result.isNewUser) {
                $scope.isNewUser = true;
            } else {
                $scope.isReturningUser = true;
            }
        });
    };

    $scope.loginUsingFacebook = function (evt) {
        if(evt) {
            evt.preventDefault();
        }
        $scope.fbConnectError = false;
        $scope.userClosedFBDialogue = false;
        if ($scope.isAppMode || $scope.isiOs) {
            window.location = 'https://m.facebook.com/dialog/oauth?client_id=480961688595420&response_type=code&redirect_uri=http://' + document.domain + '/fbAppConnect2&scope=email';
        } else {
            FB.login(function(response) {
                if (response.authResponse) {
                    FB.api('/me', function(apiResponse) {
                        if (apiResponse) {
                            $http.post('/api/signin/signinFB', { email : apiResponse.email }).success(function (result) {
                                window.location = result.url;
                            }).error(function() {
                                $scope.fbConnectError = true;
                                $scope.$apply();
                            });
                        } else {
                            $scope.fbConnectError = true;
                            $scope.$apply();
                        }
                    });
                } else {
                    $scope.userClosedFBDialogue = true;
                    $scope.$apply();
                }
            }, {scope: 'email'});
        }
    }
    init();
});