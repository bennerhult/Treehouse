treehouseApp.controller('friendController', function($scope, pageService, $http, $routeParams) {
    "use strict";
    $scope.location = pageService.getLocation();
    $scope.isLoading = true;
    pageService.setTitle('Visiting friend'); //TODO: Name

    $http.post('/api/friend/init', { friendUserId : $routeParams.friendUserId }).success(function(r) {
        $scope.isLoading = false;
        $scope.friend = r.friend;
    });

    if($routeParams.backurl) {
        $scope.backurl = $routeParams.backurl
    }
});
