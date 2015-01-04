var achievementApp = angular.module('App', ['ngRoute']);

achievementApp.controller('commonController', function($scope, $http, $location) {
    $scope.isLoading = true;
    $http.post('/api/init', {}).success(function(result) {
        $scope.prettyName = result.prettyName;
        $scope.userImageURL = result.userImageURL;
        $scope.isLoading = false;
    });

    $scope.getClass = function(path) {
        if ($location.path().substr(0, path.length) == path) {
            return "selected"
        } else {
            return ""
        }
    }
});

achievementApp.factory("achievementService",function(){
    var service = {};

    service.setAchievement = function(currentAchievement){
        this.achievement = currentAchievement;
    }

    return service;
});

//TODO rätt meny och titel
//TODO flytta alla sidor till singlePageApp
//TODO signin2
//TODO preSignin
//TODO kunna refresha ett achievement
//TODO kunna refresha achievements/friends/more/newsfeed
//TODO visa achievement snyggt
//TODO ta bort dupliceringen av respondWithJson