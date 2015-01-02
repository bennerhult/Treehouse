var achievementApp = angular.module('App', ['ngRoute']);

achievementApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        //TODO fixa more-länk från app/achievements/achievement
        //TODO skicka med achievementId
        //TODO skicka med userid
        //TODO visa achievement snyggt
        //TODO kunna refresha ett achievement
        //TODO fixa pretty URLS https://scotch.io/quick-tips/pretty-urls-in-angularjs-removing-the-hashtag
        //TODO flytta alla sidor till singlePageApp
        .when('/achievement', { ///:userId ///{{achievement._id}} i länken
            templateUrl: '/server-templates/achievement.html',
            controller: 'Ctrl'
        });
       /* .otherwise({
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