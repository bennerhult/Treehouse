var achievementApp = angular.module('App', ['ngRoute']);

achievementApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        //TODO Resource interpreted as Image but transferred with MIME type text/html: "http://localhost:1337/". achievements:38
        //TODO visa achievement snyggt
        //TODO fixa pretty URLS https://scotch.io/quick-tips/pretty-urls-in-angularjs-removing-the-hashtag
        //TODO kunna refresha ett achievement
        //TODO flytta alla sidor till singlePageApp
        .when('/achievement/:achievementId', {
            templateUrl: '/server-templates/achievement.html',
            controller: 'achievementController'
        })
        /*.otherwise({
            redirectTo: '/'
        });*/
}]);

achievementApp.controller('Ctrl', function($scope, $http) {
    $scope.isLoading = true;
    $http.post('/api/achievements/init', {}).success(function(result) {
        $scope.achievementList = result.achievementList;
        $scope.prettyName = result.prettyName;
        $scope.userImageURL = result.userImageURL;
        $scope.isLoading = false;
    });
});

achievementApp.controller('achievementController', function($scope,  $routeParams) {
    $scope.achievementId = $routeParams.achievementId;
});