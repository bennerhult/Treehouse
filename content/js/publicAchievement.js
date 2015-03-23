treehouseApp.controller('publicAchievementController', function($scope, $http, $routeParams, pageService, achievementService) {
    pageService.setTitle('Public Achievement');

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
        initCreatedBy($scope, $http, result.achievementInstance.createdBy);
    });
};

function initCreatedBy($scope, $http, userId) {
    $http.post('/api/publicAchievement/initCreatedBy', {
        userId : userId
    }).success(function(result) {
        $scope.creator = result.createdBy;
    });
}