treehouseApp.controller('publicAchievementController', function($scope, $http, $routeParams, pageService, achievementService) {
    $scope.isLoading = true;
    pageService.setTitle('Public Achievement');
    initAchievement($scope, $http, $routeParams);
    if(pageService.username) {
        $scope.signedInUser = true;
    }
    
    $scope.fbShare = function(caption, imageURL) {
       /*if (!imageURL.startsWith('https:')) {
            imageURL = 'http://www.treehouse.io/' + imageURL; //TODO ERIK dynamic domain
        }*/
        var achLink = 'http://' + $scope.pageDomain + '/public/achievementInstance/' + $routeParams.achievementInstanceId;
        alert(achLink)
        FB.ui({
            method: 'feed',
            app_id: '480961688595420', //906464552711796 test
            link: achLink,
            redirect_uri: achLink, //When using FB.ui, you should not specify a redirect_uri
            picture: imageURL,
            caption: (caption) //decodeURIComponent(caption) //TODO ERIK remove
        }, function(response){});
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
            window.location.hash = '/app/';
        }
    });
};