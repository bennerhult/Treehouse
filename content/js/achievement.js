treehouseApp.controller('achievementController', function($scope, $http, achievementService, pageService) {
    pageService.setTitle('Achievement');
    $scope.achievement = achievementService.achievement;

    $scope.deleteAchievement = function(evt) {
        evt.preventDefault();
        $http.post('/api/achievements/deleteAchievement', {
            achievementId : $scope.achievement._id
        }).success(function(result) {
            document.location =  result.url;
        });
    }
});