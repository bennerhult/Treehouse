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
                        user.User.find().or(ids).exec(function(err, result) {
                            if(err) {
                                throw err;
                            }
                            for(var j=0; j<result.length; j++) {
                                allFriends.push({ imageURL : result[j].imageURL, username : result[j].username, direction : direction });
                            }
                            cb();
                        });
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
    }

    return {
        registerHandlers : registerHandlers
    };
};
