treehouseApp.controller('publicAchievementController', function($scope, $http, $routeParams, pageService) {
    pageService.setTitle('Public Achievement');
    $scope.achievement

    if(!$scope.achievement) {
        $http.post('/api/publicAchievement/init', {
            achievementInstanceId : $routeParams.achievementInstanceId
        }).success(function(result) {
            $scope.achievement = result.achievementInstance;
        });
    }
});