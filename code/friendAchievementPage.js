module.exports = function (app, friendship, user, requestHandlers, achievementInstance) {
    'use strict';

    var _ = require("underscore")._

    app.post('/api/friendAchievement/compareList', function (request, response) {
        var userId = request.body.friend._id;
        var achievementId = request.body.achievementInstance.achievementId
        achievementInstance.getCompareList(userId, achievementId, function (compareList) {
            var result = new Object();
            result.compareList = compareList;
            requestHandlers.respondWithJson(response, result);
        });
    });

    function registerHandlers() {
        app.post('/api/friendAchievement/init', function (request, response) {
            var friendUserId = request.body.friendUserId;
            var friendAchievementId = request.body.achievementId;
            user.User.findOne({ _id: friendUserId }, function (err, friendUser) {
                if (err) {
                    throw err;
                }
                if (!friendUser) {
                    throw 'no such user';
                }
                achievementInstance.AchievementInstance.findOne({ _id: friendAchievementId }, function (err2, ai) {
                    achievementInstance.AchievementInstance.findOne({
                        achievementId: ai.achievementId,
                        createdBy: friendUserId
                    }, function (err, eventualSharedAchievementInstance) {
                        if (!achievementInstance.isVisibleToUser(ai, request.session.currentUser._id, eventualSharedAchievementInstance)) {
                            throw 'haxorattempt!';
                        }
                    });

                    var u = {}
                    u.friend = {
                        _id: friendUser._id,
                        username: friendUser.username,
                        prettyName: user.getPrettyName(friendUser),
                        imageURL: friendUser.imageURL
                    }

                    u.achievement = ai
                    requestHandlers.respondWithJson(response, u)
                })
            })
        });
    }

    return {
        registerHandlers
    };
};