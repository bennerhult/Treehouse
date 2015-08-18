var treehouseApp = angular.module('App', ['ngRoute']);

treehouseApp.factory("achievementService",function() {
    var service = {};

    service.setAchievement = function(currentAchievement) {
        this.achievement = currentAchievement;
    };

    return service;
});

treehouseApp.factory('pageService', function($location) {
    var service = {};
            
    service.setTitle = function(title) {
        this.pageTitle = title;
    }
    
    service.getLocation = function () {
         var location = $location.path()
         var s = $location.search()
         if(s.backurl) {
             location = location + '?backurl=' + encodeURIComponent(s.backurl)
         }
         return encodeURIComponent(location)
    }

    service.setName = function(firstName, lastName, username) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;

        if (firstName && lastName) {
            this.prettyName = firstName + " " + lastName;
        } else if (firstName) {
            this.prettyName = firstName;
        } else if (lastName) {
            this.prettyName =  lastName;
        } else  {
            this.prettyName = username;
        }
    }

    service.setUserImageURL = function(userImageURL) {
        this.userImageURL = userImageURL;
    }

    service.setIsiOs = function(isiOs) {
        this.isiOs = isiOs;
    }

    return service;
});

treehouseApp.controller('commonController', function($scope, $http, $location, $timeout, pageService) {
    "use strict";
    $scope.isLoading = true;
    $scope.pageService = pageService;
    pageService.setTitle('Treehouse');
    $scope.pageDomain = document.domain;

    function init() {
        $timeout(function () {
            FB.init({
                appId: '480961688595420',
                status: true,
                cookie: true,
                xfbml: true,
                channelUrl : '//www.treehouse.io/channel.html',  //increases performance
                oauth: true
            });
        }); 
    }
    
    $http.post('/api/init', {}).success(function(result) {
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

    $scope.fbShare = function(caption, achLink, imageURL) {
       /*if (!imageURL.startsWith('https:')) {
            imageURL = 'http://www.treehouse.io/' + imageURL; //TODO ERIK dynamic domain
        }*/
        alert(achLink)
        FB.ui({
            method: 'feed',
            app_id: '906464552711796', //480961688595420
            link: achLink,
            redirect_uri: achLink, //When using FB.ui, you should not specify a redirect_uri
            picture: imageURL,
            caption: (caption) //decodeURIComponent(caption) //TODO ERIK remove
        }, function(response){});
    }

    $scope.getClass = function(path) {
        if ($location.path().substr(0, path.length) == path) {
            return "selected";
        } else {
            return "";
        }
    }

    $scope.onlyIfRegularAppPage = function(className) {
        if ($location.path().substr(0, 5) === '/app/' || $location.path().substr(0, 28) === '/public/achievementInstance/') {
            return className;
        } else {
            return '';
        }
    };

    $scope.isRegularAppPage = function() {
        if ($location.path().substr(0, 5) === '/app/'  || $location.path().substr(0, 28) === '/public/achievementInstance/') {
            return true;
        } else {
            return false;
        }
    };

    $scope.incFriendCount = function () {
        if($scope.incomingFriendRequestsCount) {
            $scope.incomingFriendRequestsCount = $scope.incomingFriendRequestsCount + 1;
        }
    };
    
    $scope.decFriendCount = function () {
        if($scope.incomingFriendRequestsCount) {
            $scope.incomingFriendRequestsCount = $scope.incomingFriendRequestsCount - 1;
        }
    };
    
    $scope.decChallengesCount = function () {
        if($scope.incomingChallengesCount) {
            $scope.incomingChallengesCount = $scope.incomingChallengesCount - 1;
        }
    };
    
    init();
});