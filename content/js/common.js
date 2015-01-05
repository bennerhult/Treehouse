var treehouseApp = angular.module('App', ['ngRoute']);

treehouseApp.factory("achievementService",function() {
    var service = {};

    service.setAchievement = function(currentAchievement){
        this.achievement = currentAchievement;
    }

    return service;
});

treehouseApp.factory('pageService', function() {
    var service = {};

    service.setTitle = function(title){
        this.pageTitle = title;
    }

    return service;
});

treehouseApp.controller('commonController', function($scope, $http, $location, pageService) {
    "use strict";
    $scope.isLoading = true;
    $scope.pageService = pageService;
    pageService.setTitle('Treehouse');

    $http.post('/api/init', {}).success(function(result) {
        $scope.prettyName = result.prettyName;
        $scope.userImageURL = result.userImageURL;
        $scope.isLoading = false;
    });

    $scope.getClass = function(path) {
        if ($location.path().substr(0, path.length) == path) {
            return "selected";
        } else {
            return "";
        }
    }

    $scope.onlyIfRegularAppPage = function(className) {
        if ($location.path().substr(0, 5) === '/app/') {
            return className;
        } else {
            return '';
        }
    }

    $scope.isRegularAppPage = function() {
        if ($location.path().substr(0, 5) === '/app/') {
            return true;
        } else {
            return false;
        }
    }
});

//TODO testa hela single page app och telefonläge på test
//TODO ta bort thPage-loadingen på signin2 och newsfeed?
//TODO visa achievement snyggt
//TODO kunna refresha ett achievement
//TODO kunna refresha achievements/friends/more/newsfeed
//TODO http://localhost:1337/signin2 The "fb-root" div has not been created, auto-creating
//TODO kolla upp ng-cloak