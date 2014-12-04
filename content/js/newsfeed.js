angular.module('App', []).controller('Ctrl', function ($scope, $http) {
    $scope.isLoading = true;
    $http.post('/api/newsfeed/init', {}).success(function(result) {
        $scope.newsItems = result.newsItems;
        $scope.prettyName = result.prettyName;
        $scope.userImageURL = result.userImageURL;
        $scope.isLoading = false;
    });

    $scope.gotoAchievement = function(evt, newsItem) {
        evt.preventDefault();
        console.log(newsItem); //TODO: Send the user to the clicked achievement (our own or the other users?)
    }
});
