treehouseApp.controller('friendController', function($scope, pageService, $http, $routeParams) {
    "use strict";
    $scope.isLoading = true;
    pageService.setTitle('Visiting friend'); //TODO: Name

    $http.post('/api/friend/init', { username : $routeParams.username }).success(function(r) {
        $scope.isLoading = false;
        $scope.friend = r.friend;
    });

    if($routeParams.backurl) {
        $scope.backurl = $routeParams.backurl
    }
});
