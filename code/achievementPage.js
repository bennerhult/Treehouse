module.exports = function (app, templates, requestHandlers, progress, moment, shareholding, achievementInstance, friendship, user) {
    'use strict';

    function registerHandlers() {
        app.post('/api/achievements/progress', function (request, response) {
            achievementInstance.progress(request.body.goal, request.body.achievementInstance, function(updatedAchievementInstance) {
                requestHandlers.respondWithJson(response, { updatedAchievementInstance : updatedAchievementInstance });
            });
        });

        app.post('/api/achievements/publicizeAchievement', function (request, response) {
            achievementInstance.publicize(request.body.achievementInstance, function(updatedAchievementInstance) {
                requestHandlers.respondWithJson(response, { updatedAchievementInstance : updatedAchievementInstance });
            });
        });

        app.post('/api/achievements/unpublicizeAchievement', function (request, response) {
            achievementInstance.unpublicize(request.body.achievementInstance, function(updatedAchievementInstance) {
                requestHandlers.respondWithJson(response, { updatedAchievementInstance : updatedAchievementInstance });
            });
        });

        app.post('/api/achievements/deleteAchievement', function (request, response) {
            achievementInstance.remove(request.body.achievementInstance, function() {});
        });
        
        app.post('/api/achievements/denyChallenge', function (request, response) {
           shareholding.denyShareHolding(request.body.achievement._id, request.session.currentUser._id, request.body.achievement.createdBy);
        });

        app.post('/api/achievements/share', function (request, response) {
            shareholding.createShareholding(request.session.currentUser._id, request.body.friend.id, request.body.achievement._id, function() {});
        });

        app.post('/api/achievements/shareToList', function (request, response) {
            var userId = request.session.currentUser._id;
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

                    var shareToList = [];
                    var fetchFriends = function (direction, ids, cb) {
                        if(ids.length == 0) {
                            cb()
                        } else {
                            user.User.find().or(ids).exec(function(err, result) {
                                if(err) {
                                    throw err;
                                }
                                for(var j=0; j<result.length; j++) {
                                    shareToList.push({ id : result[j]._id, imageURL : result[j].imageURL, username : result[j].username, direction : direction, prettyName : user.getPrettyName(result[j]) });
                                }
                                cb();
                            });
                        }
                    }

                    fetchFriends('confirmed', confirmedFriendUsersFilter, function () {
                        requestHandlers.respondWithJson(response, shareToList);
                    });
                });
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}