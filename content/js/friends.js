angular.module('App', []).controller('Ctrl', function ($scope, $http) {
    $scope.isLoading = true;
    $http.post('/api/friends/init', {}).success(function(result) {
        $scope.prettyName = result.prettyName;
        $scope.userImageURL = result.userImageURL;
        $scope.isLoading = false;
    });
});