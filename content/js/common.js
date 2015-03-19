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

    service.setTitle = function(title) {
        this.pageTitle = title;
    }

    service.setName = function(firstName, lastName, username) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;

        if (firstName && lastName) {
            this.prettyName = firstName + " " + lastName;
        } else if (firstName) {
            this.prettyName = firstName;
        } else if (lastName) {
            this.prettyName =  lastName;
        } else  {
            this.prettyName = username;
        }
    }

    service.setUserImageURL = function(userImageURL) {
        this.userImageURL = userImageURL;
    }

    service.setIsiOs = function(isiOs) {
        this.isiOs = isiOs;
    }

    return service;
});

treehouseApp.controller('commonController', function($scope, $http, $location, pageService) {
    "use strict";
    $scope.isLoading = true;
    $scope.pageService = pageService;
    pageService.setTitle('Treehouse');

    $http.post('/api/init', {}).success(function(result) {
        pageService.setName(result.firstName, result.lastName, result.username);
        pageService.setUserImageURL(result.userImageURL);
        $scope.isiPad = navigator.userAgent.match(/iPad/i) != null;
        $scope.isiPhone = navigator.userAgent.match(/iPhone/i) != null;
        var isiOs = $scope.isiPad || $scope.isiPhone;
        pageService.setIsiOs(isiOs);
        //TODO add pageService.isAppMode
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