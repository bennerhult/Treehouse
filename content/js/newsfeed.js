achievementApp.controller('newsfeedController', function($scope, $http) {
    "use strict";
    $scope.isLoading = true;
    $http.post('/api/newsfeed/init', {}).success(function(result) {
        $scope.newsItems = result.newsItems;
        $scope.isLoading = false;
    });

    $scope.gotoAchievement = function(evt, newsItem) {
        evt.preventDefault();
        console.log(newsItem); //TODO: Send the user to the clicked achievement (our own or the other users?) - ERIK: the other users!
    }
});