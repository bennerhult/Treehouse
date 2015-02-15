treehouseApp.controller('friendsController', function($scope, pageService, $http) {
    "use strict";
    $scope.isLoading = true;
    pageService.setTitle('Friends');
    $scope.friends = [];
    $http.post('/api/friends/init', {}).success(function(r) {
        $scope.friends = r;
        $scope.isLoading = false;
    });
});
