treehouseApp.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/app/more', {
            templateUrl: '/server-templates/more.html',
            controller: 'moreController'
        })
        .when('/app/friends', {
            templateUrl: '/server-templates/friends.html',
            controller: 'friendsController'
        })
        .when('/app/newsfeed', {
            templateUrl: '/server-templates/newsfeed.html',
            controller: 'newsfeedController'
        })
        .when('/app/achievement', {
            templateUrl: '/server-templates/achievement.html',
            controller: 'achievementController'
        })
        .when('/app/achievements', {
            templateUrl: '/server-templates/achievements.html',
            controller: 'achievementsController'
        })
    $locationProvider.html5Mode(true);
});