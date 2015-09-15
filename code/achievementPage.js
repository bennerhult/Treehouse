module.exports = function (app, templates, requestHandlers, progress, moment, shareholding, achievementInstance, friendship, user) {
    'use strict';

    function registerHandlers() {
        app.post('/api/achievements/progress', function (request, response) {
            achievementInstance.progress(request.body.goal, request.body.achievementInstance, function (updatedAchievementInstance) {
                requestHandlers.respondWithJson(response, { updatedAchievementInstance: updatedAchievementInstance });
            });
        });

        app.post('/api/achievements/publicizeAchievement', function (request, response) {
            achievementInstance.publicize(request.body.achievementInstance, function (updatedAchievementInstance) {
                requestHandlers.respondWithJson(response, { updatedAchievementInstance: updatedAchievementInstance });
            });
        });

        app.post('/api/achievements/unpublicizeAchievement', function (request, response) {
            achievementInstance.unpublicize(request.body.achievementInstance, function (updatedAchievementInstance) {
                requestHandlers.respondWithJson(response, { updatedAchievementInstance: updatedAchievementInstance });
            });
        });

        app.post('/api/achievements/deleteAchievement', function (request, response) {
            achievementInstance.remove(request.body.achievementInstance, function () { });
        });

        app.post('/api/achievements/acceptChallenge', function (request, response) {
            shareholding.acceptShareHolding(request.body.achievementInstance, request.session.currentUser, request.body.achievementInstance.createdBy, function (newAchievementInstance) {
                requestHandlers.respondWithJson(response, { newAchievementInstance: newAchievementInstance });
            });
        });

        app.post('/api/achievements/denyChallenge', function (request, response) {
            shareholding.denyShareHolding(request.body.achievementInstance.achievementId, request.session.currentUser._id, request.body.achievementInstance.createdBy);
        });

        app.post('/api/achievements/share', function (request, response) {
            shareholding.createShareholding(request.session.currentUser._id, request.body.friend.id, request.body.achievementInstance.achievementId, function () { });
        });

        app.post('/api/achievements/compareList', function (request, response) {
            var userId = request.session.currentUser._id;
            var achievementId = request.body.achievementInstance.achievementId
           
            achievementInstance.getCompareList(userId, achievementId, function(compareList) {
                var result = new Object();
                result.compareList = compareList;
                requestHandlers.respondWithJson(response, result);
            });
        });
        
        app.post('/api/achievements/shareToList', function (request, response) {
            var userId = request.session.currentUser._id;
            friendship
                .Friendship
                .find().or([{ friend1_id: userId }, { friend2_id: userId }])
                .exec(function (err, result) {
                if (err) {
                    throw err;
                }
                var confirmedFriendUsersFilter = [];
                var incomingFriendUserFilter = [];
                var outgoingFriendUserFilter = [];
                for (var i = 0; i < result.length; i++) {
                    var uid;
                    var isIncoming;
                    if (result[i].friend2_id == userId) {
                        isIncoming = true;
                        uid = result[i].friend1_id;
                    } else {
                        isIncoming = false;
                        uid = result[i].friend2_id;
                    }
                    if (result[i].confirmed) {
                        confirmedFriendUsersFilter.push({ _id: uid });
                    } else if (isIncoming) {
                        incomingFriendUserFilter.push({ _id: uid });
                    } else {
                        outgoingFriendUserFilter.push({ _id: uid });
                    }
                }

                var shareToList = [];
                var shareToPendingList = [];
                var shareToAcceptedList = [];
                var achievementId = request.body.achievementInstance.achievementId;
                var async = require('async');

                var fetchFriends = function (ids, cb) {
                    if (ids.length == 0) {
                        cb();
                    } else {
                        user.User.find().or(ids).exec(function (err, result) {
                            if (err) {
                                throw err;
                            }
                            async.each(result, function (foundFriend, friendProcessed) {
                                addToLists(foundFriend, friendProcessed);
                            }, function (err) {
                                    if (err) {
                                        throw err
                                    }
                                    cb();
                                });
                        });
                    }
                };

                var addToLists = function (foundFriend, friendProcessed) {
                    shareholding.Shareholding.findOne({ shareholder_id: foundFriend._id, achievement_id: achievementId }, function (err, existingShareholding) {
                        if (existingShareholding && existingShareholding.confirmed === false) {
                            shareToPendingList.push({ id: foundFriend._id, imageURL: foundFriend.imageURL, username: foundFriend.username, prettyName: user.getPrettyName(foundFriend) });
                            friendProcessed();
                        } else if (existingShareholding && existingShareholding.confirmed === true) {
                            shareToAcceptedList.push({ id: foundFriend._id, imageURL: foundFriend.imageURL, username: foundFriend.username, prettyName: user.getPrettyName(foundFriend) });
                            friendProcessed();
                        } else {
                            shareToList.push({ id: foundFriend._id, imageURL: foundFriend.imageURL, username: foundFriend.username, prettyName: user.getPrettyName(foundFriend) });
                            friendProcessed();
                        }
                    });

                };

                fetchFriends(confirmedFriendUsersFilter, function () {
                    var result = new Object();
                    result.shareToList = shareToList;
                    result.shareToPendingList = shareToPendingList;
                    result.shareToAcceptedList = shareToAcceptedList;
                    requestHandlers.respondWithJson(response, result);
                });
            });
        });
    }

    return {
        registerHandlers
    };
};