treehouseApp.controller('achievementsController', function($scope, $http, achievementService, pageService) {
    $scope.isLoading = true;
    pageService.setTitle('Achievements');

    $http.post('/api/achievements/init', {}).success(function(result) {
        $scope.progressList = result.progressList;
        $scope.unlockedList = result.unlockedList;

        $scope.achievementList = result.progressList;
        $scope.isLoading = false;
        $scope.showingProgressList = true;
    });

    $scope.openAchievement = function (chosenAchievement) {
        achievementService.setAchievement(chosenAchievement);
    };

    $scope.showProgressList = function () {
        $scope.showingProgressList = true;
        $scope.achievementList = $scope.progressList;
    };

    $scope.showUnlockedList = function () {
        $scope.showingProgressList = false;
        $scope.achievementList = $scope.unlockedList;
    };
});