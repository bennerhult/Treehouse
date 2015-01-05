treehouseApp.controller('achievementController', function($scope,  $routeParams, achievementService, pageService) {
    pageService.setTitle('Achievement');
    $scope.achievementId = $routeParams.achievementId;
    $scope.achievement = achievementService.achievement;
});