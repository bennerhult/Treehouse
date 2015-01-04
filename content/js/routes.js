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

        //TODO rätt selected i menyn
        //TODO rätt meny och titel
        //TODO flytta alla sidor till singlePageApp
            //TODO signin2
            //TODO preSignin
        //TODO kunna refresha ett achievement
        //TODO visa achievement snyggt
        //TODO ta bort dupliceringen av respondWithJson

        .when('/app/more', {
            templateUrl: '/server-templates/more.html',
            controller: 'moreController'
        })
        .when('/app/friends', {
            templateUrl: '/server-templates/friends.html',
            controller: 'friendsController'
        })
        .when('/app/newsfeed', {
            templateUrl: '/server-templates/newsfeed.html',
            controller: 'newsfeedController'
        })
        .when('/app/achievement', {
            templateUrl: '/server-templates/achievement.html',
            controller: 'achievementController'
        })
        .when('/app/achievements', {
            templateUrl: '/server-templates/achievements.html',
            controller: 'achievementsController'
        })
    $locationProvider.html5Mode(true);
});

achievementApp.controller('commonController', function($scope, $http) {
    $scope.isLoading = true;
    $http.post('/api/init', {}).success(function(result) {
        $scope.prettyName = result.prettyName;
        $scope.userImageURL = result.userImageURL;
        $scope.isLoading = false;
    });
});