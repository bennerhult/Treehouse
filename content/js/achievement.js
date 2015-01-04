achievementApp.controller('achievementController', function($scope,  $routeParams, achievementService) {
    $scope.achievementId = $routeParams.achievementId;
    $scope.achievement = achievementService.achievement;
});