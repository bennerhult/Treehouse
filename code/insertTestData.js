/*
 Some notes about what this does.

 It makes up a test user and returns a login url you can use to become that user.

 Don't try to login the normal way as the emails generated for this user are all of the form testuser+<guid>@treehouse.io which does not exist.

 Future improvements:
 - Add a bunch of friends
 - Add pending incoming friend requests
 - Add pending outgoing friend requests
 - Generate some fake names from name lists to test searching
 - Add some achievements
 - Add some achivement progress
*/
module.exports = function (user, loginToken, thSettings, friendship) {
    "use strict";

    var fn = require('./fakeNameGenerator.js')

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    function createUser(prefix, cb) {
        var name = fn.generateName()
        //TODO: Swap the uid for some name generation thing that makes is shorter and somewhat readable
        var email = (prefix + name.firstName + '-' + name.lastName + '@treehouse.io').toLowerCase();
        var moreFields = { firstName : name.firstName, lastName : name.lastName }
        user.createUser(email, function (user, err) {
            if(err) {
                throw err;
            }
            cb(user);
        }, moreFields);
    }

    function createFriendsForUser(user, cb) {
        var addAFriend = function (cba) {
            createUser('f-', function (u1) {
                friendship.createFriendship(u1._id, user._id, function (crap, friendship_id) {
                    friendship.confirmFriendRequest(friendship_id, cba);
                })
            })
        }

        var addIncomingFriendRequest = function (cba) {
            createUser('if-', function (u1) {
                friendship.createFriendship(u1._id, user._id, function () {
                    cba();
                })
            })
        }

        var addOutgoingFriendRequest = function (cba) {
            createUser('of-', function (u1) {
                friendship.createFriendship(user._id, u1._id, function () {
                    cba();
                })
            })
        }

        //Find some way to kill all these christmas trees
        addAFriend(function () {
            addIncomingFriendRequest(function () {
                addOutgoingFriendRequest(function () {
                    cb()
                })
            })
        })
    }

    function createNewTestUser(cb) {
        createUser('', function (user) {
            loginToken.createToken(user.username, function (token) {
                var loginUrl = thSettings.getDomain() + "signinByEmail?email=" + encodeURIComponent(user.username) + "&token=" + encodeURIComponent(token.token);
                createFriendsForUser(user, function () {
                    cb(loginUrl);
                })
            });
        });
    }

    return {
        createNewTestUser : createNewTestUser
    };
};
