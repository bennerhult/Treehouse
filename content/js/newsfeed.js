treehouseApp.controller('newsfeedController', function($scope, $http, pageService) {
    "use strict";
    $scope.isLoading = true;
    pageService.setTitle('Newsfeed');

    $http.post('/api/newsfeed/init', {}).success(function(result) {
        $scope.newsItems = result.newsItems;
        $scope.isLoading = false;


    });

    $http.post('/api/init', {}).success(function(result) {
        $scope.prettyName = result.prettyName;
        $scope.userImageURL = result.userImageURL;
        $scope.isLoading = false;
    });

    $scope.gotoAchievement = function(evt, newsItem) {
        evt.preventDefault();
        console.log(newsItem); //TODO: Send the user to the clicked achievement (our own or the other users?) - ERIK: the other users!
    }
});