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

    $scope.loginUsingFacebook = function (evt) {
        if(evt) {
            evt.preventDefault();
        }
        $scope.userClosedFBDialogue = false;
        if ($scope.isAppMode || $scope.isiOs) {
            window.location = "https://m.facebook.com/dialog/oauth?client_id=480961688595420&response_type=code&redirect_uri=http://www.treehouse.io/fbAppConnect&scope=email"
        } else {

            FB.login(function(response) {
                if (response.authResponse) {
                    FB.api('/me', function(apiResponse) {
                        if (apiResponse) {
                            $scope.emailAddress = apiResponse.email;
                            //alert("fb email: " +  apiResponse.email)
                            $http.post('/api/login2/signinFB', { email : $scope.emailAddress }).success(function (result) {
                                alert('newsfeed2')

                                response.redirect(302, '/newsfeed2');
                                //callback(result, true);
                            }).error(function(result) {
                                //TODO: How to present to user
                            });
                        } else {
                            $scope.fbConnectError = true;
                        }
                    })
                } else {
                    $scope.userClosedFBDialogue = true; //TODO why is not error message shown on page?
                }
            }, {scope: 'email'});
        }
    }

    init();
});