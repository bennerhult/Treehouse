treehouseApp.controller('achievementsController', function($scope, $http, achievementService, pageService) {
    $scope.isLoading = true;
    pageService.setTitle('Achievements');

    $http.post('/api/achievements/init', {}).success(function(result) {
        $scope.progressList = result.progressList;
        $scope.unlockedList = result.unlockedList;

        $scope.achievementList = result.progressList;
        $scope.isLoading = false;
    });

    $scope.openAchievement = function (chosenAchievement) {
        achievementService.setAchievement(chosenAchievement);
    };

    $scope.showProgressList = function () {
        $scope.achievementList = $scope.progressList;
    };

    $scope.showUnlockedList = function () {
        $scope.achievementList = $scope.unlockedList;
    };
    
    //TODO markera rätt flik
    //TODO inte kunna klicka på vald flik
    //TODO visa unlocked-datum

});