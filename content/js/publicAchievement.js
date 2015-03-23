treehouseApp.controller('publicAchievementController', function($scope, $http, $routeParams, pageService, achievementService) {
    pageService.setTitle('Public Achievement');
    if(!pageService.username) { //not logged in
        init($scope, $http, $routeParams);
    } else {
        $scope.signedInUser = true;
        if (achievementService.achievement) {
            $scope.achievement = achievementService.achievement;
        } else {
            init($scope, $http, $routeParams);
        }
    };
});
function init($scope, $http, $routeParams) {
    $http.post('/api/publicAchievement/init', {
        achievementInstanceId : $routeParams.achievementInstanceId
    }).success(function(result) {
        $scope.achievement = result.achievementInstance;
    });
}