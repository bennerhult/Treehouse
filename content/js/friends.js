treehouseApp.controller('friendsController', function($scope, pageService) {
    "use strict";
    $scope.isLoading = true;
    pageService.setTitle('Friends');
});
