var treehouseApp = angular.module('App', ['ngRoute']);

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) == 0;
    }
}

treehouseApp.directive('fbLike', function ($window, $rootScope) {
    return {
        restrict: 'A',
        scope: {
            fbLike: '=?'
        },
        link: function (scope, element, attrs) {
            if (!$window.FB) {
                $.getScript('//connect.facebook.net/en_US/sdk.js', function () {
                    renderLikeButton();
                });           
            //alternativ    
           /*     (function(d, s, id) {
              var js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) return;
              js = d.createElement(s); js.id = id;
              js.src = "//connect.facebook.net/en_US/all.js"; //#xfbml=1&appId=480961688595420
              fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));*/
            } else {
                renderLikeButton();
            }

            var watchAdded = false;
            function renderLikeButton() {
                if (!!attrs.fbLike && !scope.fbLike && !watchAdded) {
                    // wait for data if it hasn't loaded yet
                    watchAdded = true;
                    var unbindWatch = scope.$watch('fbLike', function (newValue, oldValue) {
                        if (newValue) {
                            renderLikeButton();
                                       
                            // only need to run once
                            unbindWatch();
                        }

                    });
                    return;
                } else {
                    element.html('<div class="fb-like"' + (!!scope.fbLike ? ' data-href="' + scope.fbLike + '"' : '') + ' data-layout="button_count" data-action="like" data-show-faces="true" data-share="true"></div>');
                    $window.FB.XFBML.parse(element.parent()[0]);
                }
            }
        }
    };
});

treehouseApp.factory("achievementService", function () {
    var service = {};

    service.setAchievement = function (currentAchievement) {
        this.achievement = currentAchievement;
    };

    return service;
});

treehouseApp.factory('pageService', function ($location) {
    var service = {};

    service.setTitle = function (title) {
        this.pageTitle = title;
    }

    service.getLocation = function () {
        var location = $location.path()
        var s = $location.search()
        if (s.backurl) {
            location = location + '?backurl=' + encodeURIComponent(s.backurl)
        }
        return encodeURIComponent(location)
    }

    service.setName = function (firstName, lastName, username) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;

        if (firstName && lastName) {
            this.prettyName = firstName + " " + lastName;
        } else if (firstName) {
            this.prettyName = firstName;
        } else if (lastName) {
            this.prettyName = lastName;
        } else {
            this.prettyName = username;
        }
    }

    service.setUserImageURL = function (userImageURL) {
        this.userImageURL = userImageURL;
    }

    service.setIsiOs = function (isiOs) {
        this.isiOs = isiOs;
    }

    return service;
});

treehouseApp.controller('commonController', function ($rootScope, $scope, $http, $location, $timeout, pageService) {
    "use strict";
    $scope.isLoading = true;
    $scope.pageService = pageService;
    pageService.setTitle('Treehouse');
    $scope.pageDomain = document.domain;
    $rootScope.facebookAppId = '480961688595420';

    $scope.myModel = {
              Url: 'http://jasonwatmore.com/post/2014/08/01/AngularJS-directives-for-social-sharing-buttons-Facebook-Like-GooglePlus-Twitter-and-Pinterest.aspx',
              Name: "AngularJS directives for social sharing buttons - Facebook, Google+, Twitter and Pinterest | Jason Watmore's Blog",
              ImageUrl: 'http://www.jasonwatmore.com/pics/jason.jpg'
          };
          
    function init() {
        $timeout(function () {
          FB.init({
                appId: $rootScope.facebookAppId,
                version: 'v2.0',
                status: true,
                cookie: true,
                xfbml: true, 
                channelUrl: '//www.treehouse.io/channel.html',  //increases performance
                oauth: true
            });
        });
    }

    $http.post('/api/init', {}).success(function (result) {
        pageService.setName(result.currentUser.firstName, result.currentUser.lastName, result.currentUser.username);
        pageService.setUserImageURL(result.currentUser.imageURL);
        $scope.incomingFriendRequestsCount = result.nrOfIncomingFriendRequests;
        $scope.incomingChallengesCount = result.nrOfIncomingChallenges;
        $scope.isiPad = navigator.userAgent.match(/iPad/i) != null;
        $scope.isiPhone = navigator.userAgent.match(/iPhone/i) != null;
        var isiOs = $scope.isiPad || $scope.isiPhone;
        pageService.setIsiOs(isiOs);
        //TODO add pageService.isAppMode
        $scope.isLoading = false;
    });

    $scope.getClass = function (path) {
        if ($location.path().substr(0, path.length) == path) {
            return "selected";
        } else {
            return "";
        }
    }

    $scope.onlyIfRegularAppPage = function (className) {
        if ($location.path().substr(0, 5) === '/app/' || $location.path().substr(0, 28) === '/public/achievementInstance/') {
            return className;
        } else {
            return '';
        }
    };

    $scope.isRegularAppPage = function () {
        if ($location.path().substr(0, 5) === '/app/' || $location.path().substr(0, 28) === '/public/achievementInstance/') {
            return true;
        } else {
            return false;
        }
    };

    $scope.incFriendCount = function () {
        if ($scope.incomingFriendRequestsCount) {
            $scope.incomingFriendRequestsCount = $scope.incomingFriendRequestsCount + 1;
        }
    };

    $scope.decFriendCount = function () {
        if ($scope.incomingFriendRequestsCount) {
            $scope.incomingFriendRequestsCount = $scope.incomingFriendRequestsCount - 1;
        }
    };

    $scope.decChallengesCount = function () {
        if ($scope.incomingChallengesCount) {
            $scope.incomingChallengesCount = $scope.incomingChallengesCount - 1;
        }
    };

    init();
});