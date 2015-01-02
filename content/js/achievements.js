var achievementApp = angular.module('App', ['ngRoute']);

achievementApp.factory("achievementService",function(){
    var service = {};
    service.achievement = 0;

    service.setAchievement = function(currentAchievement){
        this.achievement = currentAchievement;
    }

    return service;
});

achievementApp.config(function($routeProvider, $locationProvider) {
    $routeProvider
        //TODO 5 dölj listan när achievement visas
        //TODO 4 visa achievement snyggt
        //TODO 3 kunna refresha ett achievement
        //TODO 2 dela upp achievment/achievmentList till två moduler
        //TODO 1 flytta alla sidor till singlePageApp
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