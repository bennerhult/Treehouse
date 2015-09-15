module.exports = function (app, friendship, user, requestHandlers, achievementInstance) {
    'use strict';

    var _ = require("underscore")._

    function registerHandlers() {
        app.post('/api/friend/init', function (request, response) {
            var friendUserId = request.body.friendUserId;

            user.User.findOne({ _id: friendUserId }, function(err, friendUser) {
                if(err) {
                    throw err;
                }
                if(!friendUser) {
                    throw 'no such user'
                }
                achievementInstance.getAchievementList(friendUser._id, function(instancesInProgress, instancesUnlocked) {
                    var u = { }
                    var achievements = []

                    _.each(instancesInProgress, function (i) {
                        if(i.publiclyVisible === true) {
                            achievements.push(i)
                        }
                    })

                    _.each(instancesUnlocked, function (i) {
                        if(i.publiclyVisible === true) {
                            achievements.push(i)
                        }
                    })

                    u.friend = {
                        _id : friendUser._id,
                        username : friendUser.username,
                        prettyName : user.getPrettyName(friendUser),
                        imageURL : friendUser.imageURL,
                        achievements
                    }
                    requestHandlers.respondWithJson(response, u)
                })
            })
        });
    }

    return {
        registerHandlers
    };
};
