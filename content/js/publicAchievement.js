treehouseApp.controller('publicAchievementController', function ($scope, $http, $routeParams, pageService, achievementService) {
    $scope.isLoading = true;
    pageService.setTitle('Public Achievement');
    initAchievement($scope, $http, $routeParams);
    if (pageService.username) {
        $scope.signedInUser = true;
    }

    $scope.fbShare = function () {
        var imageURL = $scope.achievement.imageURL;
        if (!imageURL.startsWith('https:')) {
            imageURL = 'http://' + $scope.pageDomain + '/' + imageURL;
        }
        var achLink = 'http://' + $scope.pageDomain + '/public/achievementInstance/' + $routeParams.achievementInstanceId;
        var caption = $scope.achievement.title;
        FB.ui({
            method: 'feed',
            app_id: '480961688595420',
            link: achLink,
            picture: imageURL,
            caption: caption
        }, function (response) { });
    }
    
    function initAchievement($scope, $http, $routeParams) {
        $http.post('/api/publicAchievement/init', {
            achievementInstanceId: $routeParams.achievementInstanceId
        }).success(function (result) {
            if (result.achievementInstance) {
                var imageURL = result.achievementInstance.imageURL;
                if (!imageURL.startsWith('https:')) {
                    imageURL = 'http://' + $scope.pageDomain + '/' + imageURL;
                }
                $scope.socialModel = {
                    description: "Check out my achievement: " + result.achievementInstance.title,
                    imageURL: imageURL
                };
                $scope.achievement = result.achievementInstance;
                $scope.creator = result.createdBy;
                $scope.isLoading = false;
            } else {
                window.location.hash = '/app/';
            }
        });
    };
});