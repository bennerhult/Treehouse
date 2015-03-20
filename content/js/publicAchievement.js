treehouseApp.controller('publicAchievementController', function($scope, $http, $routeParams, pageService) {
    pageService.setTitle('Public Achievement');

    //TODO bara om man inte är inloggad
    $http.post('/api/publicAchievement/init', {
        achievementInstanceId : $routeParams.achievementInstanceId
    }).success(function(result) {
        $scope.achievement = result.achievementInstance;
    });
});