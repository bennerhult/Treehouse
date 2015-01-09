treehouseApp.controller('moreController', function($scope, $http, pageService) {
    "use strict";
    pageService.setTitle('More');

    $scope.uploadUserImage = function(evt, newsItem) {
        evt.preventDefault();
        console.log("uploading user IMAGE"); //TODO upload user image
    }

    $scope.signout = function(evt) {
        evt.preventDefault();

        $http.post('/api/more/signout', {}).success(function(result) {
            document.location =  result.url;
        });
    }
});