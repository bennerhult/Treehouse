treehouseApp.controller('challengeController', function($scope, $http, achievementService, pageService) {
    pageService.setTitle('Challenge');
    $scope.achievement = achievementService.achievement;
   
    $scope.denyChallenge = function(evt) {
        $http.post('/api/achievements/denyChallenge', {
            achievementInstance : $scope.achievement
        }).success(function() {});
    }
 
    $scope.acceptChallenge = function(evt) {
        $http.post('/api/achievements/acceptChallenge', {
            achievementInstance : $scope.achievement
        }).success(function(newAchievementInstance) {
             $scope.achievement = newAchievementInstance;
        });
    }
});