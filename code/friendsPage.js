module.exports = function (app, friendship, user, requestHandlers) {
    'use strict';

    function registerHandlers() {
        app.post('/api/friends/init', function (request, response) {
            var userId = request.session.currentUser._id
            friendship
                .Friendship
                .find().or([{ friend1_id: userId }, { friend2_id: userId }])
                .exec(function(err, result) {
                    if(err) {
                        throw err;
                    }
                    var confirmedFriendUsersFilter = []
                    var incomingFriendUserFilter = []
                    var outgoingFriendUserFilter = []
                    for(var i=0; i<result.length; i++) {
                        var uid;
                        var isIncoming;
                        if(result[i].friend2_id == userId) {
                            isIncoming = true
                            uid = result[i].friend1_id
                        } else {
                            isIncoming = false
                            uid = result[i].friend2_id
                        }
                        if(result[i].confirmed) {
                            confirmedFriendUsersFilter.push({ _id : uid });
                        } else if (isIncoming) {
                            incomingFriendUserFilter.push({ _id : uid });
                        } else {
                            outgoingFriendUserFilter.push({ _id : uid });
                        }
                    }

                    var allFriends = [];
                    var fetchFriends = function (direction, ids, cb) {
                        if(ids.length == 0) {
                            cb()
                        } else {
                            user.User.find().or(ids).exec(function(err, result) {
                                if(err) {
                                    throw err;
                                }
                                for(var j=0; j<result.length; j++) {
                                    allFriends.push({ _id : result[j]._id, imageURL : result[j].imageURL, username : result[j].username, direction : direction, prettyName : user.getPrettyName(result[j]) });
                                }
                                cb();
                            });
                        }
                    }

                    fetchFriends('confirmed', confirmedFriendUsersFilter, function () {
                        fetchFriends('incoming', incomingFriendUserFilter, function () {
                            fetchFriends('outgoing', outgoingFriendUserFilter, function () {
                                requestHandlers.respondWithJson(response, allFriends);
                            })
                        });
                    });
                });
        });

        app.post('/api/friends/removeUser', function (request, response) {
            var userId = request.session.currentUser._id
            user.User.findOne({ username: request.body.username }, function(err, friendUser) {
                friendship.unfriendUserById(request.session.currentUser._id, friendUser._id, request.body.direction, function () {
                    requestHandlers.respondWithJson(response, {})
                })
            })
        });


        app.post('/api/friends/findUserByEmail', function (request, response) {
            user.User.findOne({ username: request.body.email }, function(err, friendUser) {
                if(err) {
                    throw err;
                }
                var u = { }
                if(friendUser) {
                    u.user = {
                        username : friendUser.username,
                        imageURL : friendUser.imageURL
                    }
                }
                requestHandlers.respondWithJson(response, u)
            })
        });

        app.post('/api/friends/sendFriendRequestByUsername', function (request, response) {
            var userId = request.session.currentUser._id
            user.User.findOne({ username: request.body.username }, function(err, friendUser) {
                if(err) {
                    throw err;
                }
                friendship.createFriendship(userId, friendUser._id, function () {
                    requestHandlers.respondWithJson(response, { friend : { imageURL : friendUser.imageURL, username : friendUser.username, direction : 'outgoing' } })
                })
            })
        });


        app.post('/api/friends/acceptFriendRequestByUsername', function (request, response) {
            var userId = request.session.currentUser._id
            user.User.findOne({ username: request.body.username }, function(err, friendUser) {
                if(err) {
                    throw err;
                }

                friendship.Friendship.findOne({ friend1_id: friendUser._id,  friend2_id: userId, confirmed: false }, function(err, fs) {
                    if(err) {
                        throw err;
                    }
                    if(fs) {
                        friendship.confirmFriendRequest(fs._id, function () {
                            requestHandlers.respondWithJson(response, {success : true})
                        })
                    } else {
                        requestHandlers.respondWithJson(response, {success : false}) //could not find any pending friend request. could be improved slightly by checking if they are already friends and just saying ok then.
                    }
                })
            })
        });
    }

    return {
        registerHandlers
    };
};
