angular.module('App', []).controller('Ctrl', function ($scope, $http) {
    $scope.isLoading = true;
    $http.post('/api/newsfeed/init', {}).success(function(result) {
        $scope.newsItems = result.newsItems;
        $scope.userEmail = result.userEmail;
        $scope.isLoading = false;
    });
});
