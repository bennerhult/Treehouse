module.exports = function (app, friendship, user, requestHandlers, achievementInstance) {
    'use strict';

    var _ = require("underscore")._

    function registerHandlers() {
        app.post('/api/friendAchievement/init', function (request, response) {
            var userId = request.session.currentUser._id
            var friendUserName = request.body.username
            var friendAchievmentId = request.body.achievementId

            user.User.findOne({ username: friendUserName }, function(err, friendUser) {
                if(err) {
                    throw err;
                }
                if(!friendUser) {
                    throw 'no such user'
                }
                
                achievementInstance.AchievementInstance.findOne({ _id : friendAchievmentId }, function(err2, ai) {
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
