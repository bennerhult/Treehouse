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

    $scope.loginUsingFacebook = function () {
        //if (isAppMode || isiOs) {
        if (false) {
            window.location = "https://m.facebook.com/dialog/oauth?client_id=480961688595420&response_type=code&redirect_uri=http://www.treehouse.io/fbAppConnect&scope=email"
        } else {
            FB.login(function(response) {
                if (response.authResponse) {
                    FB.api('/me', function(apiResponse) {
                        if (apiResponse) {
                            checkFBUserOnServer(apiResponse.email,
                                function(id, ok) {
                                    if (ok) {
                                        openNewsfeed()
                                    } else {
                                        $("#message").html("Facebook did not play nice. Try regular login instead.")
                                    }
                                }
                            )
                        } else {
                            $("#message").html('Facebook did not play nice! Try regular login instead.')
                        }
                    })
                } else {
                    $("#message").html('No worries! Try regular login instead.')   //the user closed the fb-login dialogue
                }
            }, {scope: 'email'})
        }
    }

    function checkFBUserOnServer(username, callback) {
        var data = "username=" + username
        var jqxhr = $scope.ajax("/checkFBUser", {
            type: "GET",
            data: data,
            dataType: "json",
            statusCode: {
                200: function(returnData) { callback(returnData, true) },
                404: function() { callback(jqxhr.responseText , false) }
            }
        })
    }
});
