treehouseApp.controller('friendAchievementController', function($scope, pageService, $http, $routeParams) {
    "use strict";
    $scope.location = pageService.getLocation()
    $scope.isLoading = true;
    pageService.setTitle('Visiting friend - Achievement'); //TODO: Name

    $http.post('/api/friendAchievement/init', { username : $routeParams.username, achievementId :  $routeParams.achievementId }).success(function(r) {        
        $scope.isLoading = false;
        $scope.friend = r.friend;
        $scope.achievement = r.achievement;
    });

    if($routeParams.backurl) {
        $scope.backurl = $routeParams.backurl;
    }
});
