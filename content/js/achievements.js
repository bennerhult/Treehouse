angular.module('App', []).controller('Ctrl', function ($scope, $http) {
    $scope.isLoading = true;
    $http.post('/api/achievements/init', {}).success(function(result) {
        $scope.achievementList = result.achievementList;
        $scope.prettyName = result.prettyName;
        $scope.userImageURL = result.userImageURL;
        $scope.isLoading = false;
    });
});