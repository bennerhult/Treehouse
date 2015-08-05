treehouseApp.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/server-templates/info.html',
            controller: 'commonController'
        })
        .when('/signin', {
            templateUrl: '/server-templates/signin.html',
            controller: 'signinController'
        })
        .when('/app/more', {
            templateUrl: '/server-templates/more.html',
            controller: 'moreController'
        })
        .when('/app/friends', {
            templateUrl: '/server-templates/friends.html',
            controller: 'friendsController'
        })
        .when('/app/friend/:friendUserId', {
            templateUrl: '/server-templates/friend.html',
            controller: 'friendController'
        })
        .when('/app/friendAchievement/:friendUserId/:achievementId', {
            templateUrl: '/server-templates/friendAchievement.html',
            controller: 'friendAchievementController'
        })
        .when('/app/newsfeed', {
            templateUrl: '/server-templates/newsfeed.html',
            controller: 'newsfeedController'
        })
        .when('/app/achievement', {
            templateUrl: '/server-templates/achievement.html',
            controller: 'achievementController'
        })
        .when('/app/challenge', {
            templateUrl: '/server-templates/challenge.html',
            controller: 'challengeController'
        })
        .when('/public/achievementInstance/:achievementInstanceId', {
            templateUrl: '/server-templates/publicAchievement.html',
            controller: 'publicAchievementController'
        })
        .when('/app/achievements', {
            templateUrl: '/server-templates/achievements.html',
            controller: 'achievementsController'
        })
        .when('/app/createAchievement', {
            templateUrl: '/server-templates/createAchievement.html',
            controller: 'createAchievementController'
        })
    $locationProvider.html5Mode(true);
});
