treehouseApp.controller('achievementController', function($scope, $http, achievementService, pageService) {
    pageService.setTitle('Achievement');
    $scope.achievement = achievementService.achievement;

    $scope.progress = function(evt, currentGoal, currentAchievement) {
        $http.post('/api/achievements/progress', {
            goal : currentGoal,
            achievement : $scope.achievement
        }).success(function(result) {
            //TODO rätt värde på achievment progressbar
            //TODO rätt värde på goal progressbar
            //TODO rätt värde på x/y
            //TODO kunna klicka flera gånger
            //TODO animera progressbarändring
            console.log("updatedAchievement.percentageComplete:  " + result.achievementPercentage)
        });
    }

    $scope.deleteAchievement = function(evt) {
        $http.post('/api/achievements/deleteAchievement', {
            achievementId : $scope.achievement._id
        }).success(function() {});
    }
});