treehouseApp.controller('createAchievementController', function($scope,  $http, pageService) {
    pageService.setTitle('Create new achievement');

    $scope.createAchievement = function(evt) {
        evt.preventDefault();
        $http.post('/api/achievements/createAchievement', {
            achievementTitle : $scope.achievementTitle,
            achievementDescription: $scope.achievementDescription
        }).success(function(result) {});
    };
});