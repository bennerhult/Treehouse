module.exports = function (app, friendship, user, requestHandlers, achievementInstance) {
    'use strict';

    var _ = require("underscore")._

    function registerHandlers() {
        app.post('/api/friendAchievement/init', function (request, response) {
            //var userId = request.session.currentUser._id
            var friendUserId = request.body.friendUserId;
            var friendAchievementId = request.body.achievementId;

            user.User.findOne({ id: friendUserId }, function(err, friendUser) {
                if(err) {
                    throw err;
                }
                if(!friendUser) {
                    throw 'no such user'
                }
                
                achievementInstance.AchievementInstance.findOne({ _id : friendAchievementId }, function(err2, ai) {
                    if(ai.publiclyVisible !== true) {
                        throw 'haxorattempt!'
                    }
                    var u = { }

                    u.friend = {
                        username : friendUser.username,
                        prettyName : user.getPrettyName(friendUser),
                        imageURL : friendUser.imageURL
                    }
                    
                    u.achievement = ai
                    requestHandlers.respondWithJson(response, u)
                })
            })
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};
