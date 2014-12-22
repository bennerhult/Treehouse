angular.module('App', []).controller('Ctrl', function ($scope, $http) {
    $scope.isLoading = true;
    $http.post('/api/more/init', {}).success(function(result) {
        $scope.prettyName = result.prettyName;
        $scope.userImageURL = result.userImageURL;
        $scope.isLoading = false;
    });

    $scope.signout = function(evt) {
        evt.preventDefault();
        console.log("signing out"); //TODO: Sign out and send to start page
    }
});