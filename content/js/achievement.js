treehouseApp.controller('achievementController', function($scope, $http, achievementService, pageService) {
    pageService.setTitle('Achievement');
    $scope.achievement = achievementService.achievement;

    $scope.progress = function(evt, currentGoal, currentAchievement) {
        $http.post('/api/achievements/progress', {
            goal : currentGoal,
            achievement : $scope.achievement
        }).success(function(result) {
            //TODO animera progressbarändring
            $scope.achievement = result.updatedAchievementInstance;
        });
    }

    $scope.deleteAchievement = function(evt) {
        $http.post('/api/achievements/deleteAchievement', {
            achievementId : $scope.achievement._id
        }).success(function() {});
    }
});