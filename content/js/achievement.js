treehouseApp.controller('achievementController', function($scope, $http, achievementService, pageService) {
    pageService.setTitle('Achievement');
    $scope.achievement = achievementService.achievement;

    $scope.progress = function(evt, currentGoal, currentAchievement) {
console.log(currentGoal.title)
        $http.post('/api/achievements/progress', {
            goal : currentGoal,
            achievement : $scope.achievement
        }).success(function(percentageComplete) {
            //TODO XXX animate progressbar
            //TODO XXX visa ändrade värden direkt
            console.log("percentageComplete1:  " + percentageComplete)
        });
    }

    $scope.deleteAchievement = function(evt) {
        $http.post('/api/achievements/deleteAchievement', {
            achievementId : $scope.achievement._id
        }).success(function() {});
    }
});