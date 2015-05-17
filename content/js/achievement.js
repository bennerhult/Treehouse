treehouseApp.controller('achievementController', function($scope, $http, achievementService, pageService) {
    pageService.setTitle('Achievement');
    $scope.achievement = achievementService.achievement;
    $scope.showingMyProgressTab = true;

    $scope.openMyProgressTab= function(evt) {
        evt.preventDefault();
        $scope.showingMyProgressTab = true;
        $scope.showingShareTab = false;
    }

    $scope.openShareTab= function(evt) {
        evt.preventDefault();
        $scope.showingMyProgressTab = false;
        $scope.showingShareTab = true;
        $http.post('/api/achievements/shareToList', {
        }).success(function(result) {
            $scope.shareToList = result;
        });
    }

    $scope.share = function(evt, achievement, friend) {
        evt.preventDefault();
        $http.post('/api/achievements/share', {
            achievement : achievement,
            friend : friend
        }).success(function(result) {

        });
    }

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