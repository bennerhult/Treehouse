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
        //TODO flytta alla sidor till singlePageApp
            //TODO friends
            //TODO more
            //TODO newsfeed
            //TODO signin2
            //TODO preSignin
        //TODO dela upp achievment/achievmentList till två moduler
        //TODO visa achievement snyggt
        //TODO kunna refresha ett achievement


        .when('/app/achievement', {
            templateUrl: '/server-templates/achievement.html',
            controller: 'achievementController'
        })
        .when('/app/achievements2', {
            templateUrl: '/server-templates/achievements2.html',
            controller: 'achievementController'
        })
        /*.otherwise({
            redirectTo: '/'
        });*/

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