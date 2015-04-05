treehouseApp.controller('friendsController', function($scope, pageService, $http, $timeout, $location) {
    "use strict";
    $scope.location = encodeURIComponent($location.path())
    $scope.isLoading = true;
    pageService.setTitle('Friends');
    $scope.friends = [];
    $http.post('/api/friends/init', {}).success(function(r) {
        $scope.friends = r;
        $scope.isLoading = false;
    });


    $scope.removeUser = function (evt, f) {
        evt.preventDefault();
        f.isHidden = true
        if(f.direction =='incoming') {
            $scope.decFriendCount()
        }
        $http.post('/api/friends/removeUser', { username : f.username, direction : f.direction }).success(function(r) {
            $scope.isLoading = false;
        });
    }

    $scope.showPageMessage = function (m) {
        $scope.pageMessage = m
        $timeout(function() { $scope.pageMessage = null }, 2500);
    }

    function findLocalFriend(email) {
        for(var i=0; i<$scope.friends.length; i++) {
            if($scope.friends[i].username.toLowerCase() == email) {
                return $scope.friends[i]
            }
        }
        return null
    }

    $scope.searchForFriend = function (evt) {
        evt.preventDefault();
        var email = $scope.searchEmail
        if(!email || email.indexOf("@") < 0) {
            $scope.showPageMessage('Invalid email')
            return;
        }

        //Check if they are already in the friend list
        var f = findLocalFriend(email)
        if(f && f.direction == 'incoming') {
            $scope.showPageMessage('You already have a pending friend request from that user.')
            return;
        } else if(f && f.direction == 'outgoing') {
            $scope.showPageMessage('You have already asked that user to be your friend.')
            return;
        } else if(f && f.direction == 'confirmed') {
            $scope.showPageMessage('That user is already your friend.')
            return;
        }

        $scope.isLoading = true
        $http.post('/api/friends/findUserByEmail', { email : email }).success(function(r) {
            $scope.isLoading = false;
            if(r.user) {
                $scope.searchHitUser = r.user
                $scope.searchEmail = null
            } else {
                $scope.showPageMessage('Sorry but we could not find a user with that email')
            }
        });
    }

    $scope.sendFriendRequest = function (evt, username) {
        $scope.isLoading = true
        $http.post('/api/friends/sendFriendRequestByUsername', { username : username }).success(function(r) {
            $scope.isLoading = false;
            if(r.friend) {
                $scope.friends.push(r.friend)
                $scope.searchHitUser = null
            } else {
                $scope.showPageMessage('Sorry, something went wrong on our end')
            }
        });
    }

    $scope.acceptFriendRequest = function (evt, f) {
        $scope.isLoading = true
        $http.post('/api/friends/acceptFriendRequestByUsername', { username : f.username }).success(function(r) {
            $scope.isLoading = false;
            if(r.success) {
                f.direction = 'confirmed'
                $scope.decFriendCount()
            } else {
                $scope.showPageMessage('Sorry, something went wrong on our end')
            }
        });
    }
});
