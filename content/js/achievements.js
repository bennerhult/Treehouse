achievementApp.controller('achievementsController', function($scope, $http, achievementService) {
    $scope.isLoading = true;
    $http.post('/api/achievements/init', {}).success(function(result) {
        $scope.achievementList = result.achievementList;
        achievementService.setAchievement($scope.achievementList[1]);
        $scope.isLoading = false;
    });

    $scope.openAchievement = function (chosenAchievement) {
        achievementService.setAchievement(chosenAchievement);
    };
});