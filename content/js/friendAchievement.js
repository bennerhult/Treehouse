treehouseApp.controller('friendAchievementController', function($scope, pageService, $http, $routeParams) {
    "use strict";
    $scope.location = pageService.getLocation()
    $scope.isLoading = true;
    $scope.showingProgressTab = true;
    $scope.showingCompareTab = false;
    pageService.setTitle('Visiting friend - Achievement'); //TODO: Name

    $http.post('/api/friendAchievement/init', { friendUserId : $routeParams.friendUserId, achievementId :  $routeParams.achievementId }).success(function(r) {        
        $scope.isLoading = false;
        $scope.friend = r.friend;
        $scope.achievement = r.achievement;
    });

    if($routeParams.backurl) {
        $scope.backurl = $routeParams.backurl;
    }  
    
     $scope.openCompareTab= function(evt, achievementInstance) {
        evt.preventDefault();
        $scope.showingProgressTab = false;
        $scope.showingCompareTab = true;
        $http.post('/api/friendAchievement/compareList', {
             achievementInstance : achievementInstance,
             friend :  $scope.friend
        }).success(function(result) {
            $scope.compareList = result.compareList;
        });
    }
    
   $scope.openProgressTab= function(evt) {
      evt.preventDefault();
      $scope.showingProgressTab = true;
      $scope.showingCompareTab = false;
    }
    
});