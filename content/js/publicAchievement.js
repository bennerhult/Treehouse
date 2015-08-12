treehouseApp.controller('publicAchievementController', function($scope, $http, $routeParams, pageService, achievementService) {
    $scope.isLoading = true;
    pageService.setTitle('Public Achievement');
    initAchievement($scope, $http, $routeParams);
    if(pageService.username) {
        $scope.signedInUser = true;
    }
});

function initAchievement($scope, $http, $routeParams) {
    $http.post('/api/publicAchievement/init', {
        achievementInstanceId : $routeParams.achievementInstanceId
    }).success(function(result) {
        if (result.achievementInstance) {
            $scope.achievement = result.achievementInstance;
            $scope.creator = result.createdBy;
            $scope.isLoading = false;
        } else {
            window.location = '/app/';
        }
    });
};