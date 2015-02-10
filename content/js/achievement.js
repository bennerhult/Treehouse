treehouseApp.controller('achievementController', function($scope, $http, achievementService, pageService) {
    pageService.setTitle('Achievement');
    $scope.achievement = achievementService.achievement;

    $scope.progress = function(evt, currentGoal) {
console.log(currentGoal.title)
        $http.post('/api/achievements/progress', {
            goal : currentGoal
        }).success(function() {
            //TODO animate progressbar
        });
    }

    $scope.deleteAchievement = function(evt) {
        $http.post('/api/achievements/deleteAchievement', {
            achievementId : $scope.achievement._id
        }).success(function() {});
    }
});