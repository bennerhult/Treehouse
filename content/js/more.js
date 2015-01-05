treehouseApp.controller('moreController', function($scope, $http, pageService) {
    "use strict";
    pageService.setTitle('More');

    $scope.signout = function(evt) {
        evt.preventDefault();

        $http.post('/api/more/signout', {}).success(function(result) {
            document.location =  result.url;
        });
    }
});