var achievementApp = angular.module('App', ['ngRoute']);

achievementApp.factory("achievementService",function(){
    var service = {};
    service.achievement = 0;

    service.setAchievement = function(currentAchievement){
        this.achievement = currentAchievement;
    }

    return service;
});

achievementApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        //TODO 6 kunna växla genom att klicka flera på raken eller dölja listan emellan?
        //TODO 5 visa achievement snyggt
        //TODO 4 kunna refresha ett achievement
        //TODO 3 dela upp achievment/achievmentList till två moduler
        //TODO 2 fixa pretty URLS https://scotch.io/quick-tips/pretty-urls-in-angularjs-removing-the-hashtag
        //TODO 1 flytta alla sidor till singlePageApp
        .when('/achievement', {
            templateUrl: '/server-templates/achievement.html',
            controller: 'achievementController'
        })
        /*.otherwise({
            redirectTo: '/'
        });*/
}]);

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
        console.log("opening achievement: " + chosenAchievement )
        achievementService.setAchievement(chosenAchievement);
    };
});

achievementApp.controller('achievementController', function($scope,  $routeParams, achievementService) {
    $scope.achievementId = $routeParams.achievementId;
    $scope.achievement = achievementService.achievement;

});