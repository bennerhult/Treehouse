treehouseApp.controller('achievementController', function($scope, $http, achievementService, pageService) {
    "use strict";
    $scope.location = pageService.getLocation();
    pageService.setTitle('Achievement');
    $scope.achievement = achievementService.achievement;
    $scope.showingMyProgressTab = true;
    $scope.showingShareTab = false;
    $scope.showingCompareTab = false;

    $scope.openMyProgressTab= function(evt) {
        evt.preventDefault();
        $scope.showingMyProgressTab = true;
        $scope.showingShareTab = false;
        $scope.showingCompareTab = false;
    }

    $scope.openShareTab= function(evt, achievementInstance) {
        evt.preventDefault();
        $scope.showingMyProgressTab = false;
        $scope.showingShareTab = true;
        $scope.showingCompareTab = false;
        $http.post('/api/achievements/shareToList', {
             achievementInstance : achievementInstance,
        }).success(function(result) {
            $scope.shareToList = result.shareToList;
            $scope.shareToPendingList = result.shareToPendingList;
            $scope.shareToAcceptedList = result.shareToAcceptedList;
        });
    }

    $scope.openCompareTab= function(evt, achievementInstance) {
        evt.preventDefault();
        $scope.showingMyProgressTab = false;
        $scope.showingShareTab = false;
        $scope.showingCompareTab = true;
        $http.post('/api/achievements/compareList', {
             achievementInstance : achievementInstance,
        }).success(function(result) {
            $scope.compareList = result.compareList;
        });
    }
    
    $scope.share = function(evt, achievementInstance, friend) {
        evt.preventDefault();

       friend.alreadyChallenged = true;
             
        $http.post('/api/achievements/share', {
            achievementInstance : achievementInstance,
            friend : friend
        });  
    };

    $scope.progress = function(evt, currentGoal) {
        evt.preventDefault();
        $http.post('/api/achievements/progress', {
            goal : currentGoal,
            achievementInstance : $scope.achievement
        }).success(function(result) {
            $scope.achievement = result.updatedAchievementInstance;
        });
    };

    $scope.publicize = function(evt) {
        evt.preventDefault();
        $http.post('/api/achievements/publicizeAchievement', {
            achievementInstance : $scope.achievement
        }).success(function(result) {
            $scope.achievement = result.updatedAchievementInstance;
        });
    };

    $scope.unpublicize = function(evt) {
        $http.post('/api/achievements/unpublicizeAchievement', {
            achievementInstance : $scope.achievement
        }).success(function(result) {
            $scope.achievement = result.updatedAchievementInstance;
        });
    };

    $scope.deleteAchievement = function(evt) {
        $http.post('/api/achievements/deleteAchievement', {
            achievementInstance : $scope.achievement
        }).success(function() {});
    };
});