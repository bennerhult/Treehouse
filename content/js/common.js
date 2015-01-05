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

    $scope.getClass = function(path) {
        if ($location.path().substr(0, path.length) == path) {
            return "selected";
        } else {
            return "";
        }
    }
});


//TODO flytta preSignin
//TODO flytta api/init till inloggning
//TODO snygga till signin2
//TODO få signout att fungera
//TODO ta bort allPages.js

//TODO http://localhost:1337/signin2 The "fb-root" div has not been created, auto-creating
//TODO http://localhost:1337/signin2 Received message of type object from http://localhost:1337, expected a string
//TODO visa achievement snyggt
//TODO kunna refresha ett achievement
//TODO kunna refresha achievements/friends/more/newsfeed
