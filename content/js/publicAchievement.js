treehouseApp.controller('publicAchievementController', function($scope, $http, $routeParams, pageService, achievementService) {
    pageService.setTitle('Public Achievement');

    initCreatedBy($scope, $http, $routeParams);

    if(!pageService.username) { //not signed in
        initAchievement($scope, $http, $routeParams);
    } else {
        $scope.signedInUser = true;
        if (achievementService.achievement) {
            $scope.achievement = achievementService.achievement;
        } else { //user is signed in but reloaded the page
            initAchievement($scope, $http, $routeParams);
        }
    };
});

function initAchievement($scope, $http, $routeParams) {
    $http.post('/api/publicAchievement/init', {
        achievementInstanceId : $routeParams.achievementInstanceId
    }).success(function(result) {
        $scope.achievement = result.achievementInstance;
    });
};

function initCreatedBy($scope, $http, $routeParams) {
    $http.post('/api/publicAchievement/initCreatedBy', {
        achievementInstanceId : $routeParams.achievementInstanceId
    }).success(function(result) {
        $scope.creator = result.createdBy;
    });
}