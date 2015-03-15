treehouseApp.controller('achievementController', function($scope, $http, achievementService, pageService) {
    pageService.setTitle('Achievement');
    $scope.achievement = achievementService.achievement;

    $scope.progress = function(evt, currentGoal) {
        $http.post('/api/achievements/progress', {
            goal : currentGoal,
            achievementInstance : $scope.achievement
        }).success(function(result) {
            $scope.achievement = result.updatedAchievementInstance;
        });
    }

    $scope.publicize = function(evt) {
        $http.post('/api/achievements/publicizeAchievement', {
            achievementInstance : $scope.achievement
        }).success(function(result) {
            $scope.achievement = result.updatedAchievementInstance;
        });
    }

    $scope.unpublicize = function(evt) {
        $http.post('/api/achievements/unpublicizeAchievement', {
            achievementInstance : $scope.achievement
        }).success(function(result) {
            $scope.achievement = result.updatedAchievementInstance;
        });
    }

    $scope.deleteAchievement = function(evt) {
        $http.post('/api/achievements/deleteAchievement', {
            achievementInstance : $scope.achievement
        }).success(function() {});
    }
});