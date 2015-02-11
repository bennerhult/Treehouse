treehouseApp.controller('achievementsController', function($scope, $http, achievementService, pageService) {
    $scope.isLoading = true;
    pageService.setTitle('Achievements');

    $http.post('/api/achievements/init', {}).success(function(result) {
        $scope.achievementList = result.achievementList;
        $scope.isLoading = false;
    });

    $scope.openAchievement = function (chosenAchievement) {
        achievementService.setAchievement(chosenAchievement);
    };
});