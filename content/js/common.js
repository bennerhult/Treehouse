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
                    /*
                    <div id="fbLikeWeb" style="overflow:visible;">
                        <div class="fb-like" data-href="http://{{pageDomain}}/" data-width="200" font="segoe ui" data-layout="standard" data-action="like" data-show-faces="true" data-share="false"></div>
                    </div>
                    <div id="fbShare">
                        <a onclick="fbShare('Treehouse', 'http://www.treehouse.io', 'content/img/treehouse.jpg')" href="javascript:void(0)"><span><img src="../content/img/f-icon.png"><p>Share</p></span></a>
                    </div>
                     */
                    element.html('<div id="fbLikeWeb" style="overflow:visible;"><div class="fb-like"' + (!!scope.fbLike ? ' data-href="' + scope.fbLike + '"' : '') + ' data-layout="standard" data-width="250" data-action="like" data-show-faces="true" data-share="true"></div></div>');
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