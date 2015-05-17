treehouseApp.controller('challengeController', function($scope, $http, achievementService, pageService) {
    pageService.setTitle('Challenge');
    $scope.achievement = achievementService.achievement;

   
    $scope.denyChallenge = function(evt) {
        $http.post('/api/achievements/denyChallenge', {
            achievement : $scope.achievement
        }).success(function() {});
    }
 
    $scope.acceptChallenge = function(evt) {
        $http.post('/api/achievements/acceptChallenge', {
            achievement : $scope.achievement
        }).success(function() {});
    }
});