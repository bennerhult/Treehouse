var achievementApp = angular.module('App', ['ngRoute']);

achievementApp.factory("achievementService",function(){
    var service = {};

    service.setAchievement = function(currentAchievement){
        this.achievement = currentAchievement;
    }

    return service;
});

achievementApp.config(function($routeProvider, $locationProvider) {
    $routeProvider

        //TODO dela upp achievment/achievmentList mfl till moduler/filer
        //TODO flytta alla sidor till singlePageApp
            //TODO signin2
            //TODO preSignin
        //TODO bryt ut hämtande av användare till egen metod (inte en del av achievement-init)
        //TODO rätt selected i menyn
        //TODO rätt meny och titel
        //TODO kunna refresha ett achievement
        //TODO visa achievement snyggt
        //TODO ta bort dupliceringen av respondWithJson

        .when('/app/more2', {
            templateUrl: '/server-templates/more.html',
            controller: 'moreController'
        })
        .when('/app/friends2', {
            templateUrl: '/server-templates/friends.html',
            controller: 'friendsController'
        })
        .when('/app/newsfeed2', {
            templateUrl: '/server-templates/newsfeed.html',
            controller: 'newsfeedController'
        })
        .when('/app/achievement', {
            templateUrl: '/server-templates/achievement.html',
            controller: 'achievementController'
        })
        .when('/app/achievements2', {
            templateUrl: '/server-templates/achievements2.html',
            controller: 'achievementController' //TODO achievements
        })
        //.otherwise({ redirectTo: '/' });
    $locationProvider.html5Mode(true);
});

achievementApp.controller('Ctrl', function($scope, $http, achievementService) {
    $scope.isLoading = true;
    $http.post('/api/achievements/init', {}).success(function(result) {
        $scope.achievementList = result.achievementList;
        achievementService.setAchievement($scope.achievementList[1]);
        $scope.prettyName = result.prettyName;
        $scope.userImageURL = result.userImageURL;
        $scope.isLoading = false;
    });

    $scope.openAchievement = function (chosenAchievement) {
        achievementService.setAchievement(chosenAchievement);
    };
});

achievementApp.controller('achievementController', function($scope,  $routeParams, achievementService) {
    $scope.achievementId = $routeParams.achievementId;
    $scope.achievement = achievementService.achievement;
});

achievementApp.controller('moreController', function($scope, $http) {
    $scope.signout = function(evt) {
        evt.preventDefault();

        $http.post('/api/more/signout', {}).success(function(result) {
            document.location =  result.url;
        });
    }
});

achievementApp.controller('friendsController', function($scope, $http) {
});

achievementApp.controller('newsfeedController', function($scope, $http) {
    "use strict";
    $scope.isLoading = true;
    $http.post('/api/newsfeed/init', {}).success(function(result) {
        $scope.newsItems = result.newsItems;
        $scope.isLoading = false;
    });

    $scope.gotoAchievement = function(evt, newsItem) {
        evt.preventDefault();
        console.log(newsItem); //TODO: Send the user to the clicked achievement (our own or the other users?) - ERIK: the other users!
    }
});