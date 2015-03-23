module.exports = function (app, templates, requestHandlers, user, progress, moment, shareholding, achievementInstance, thSettings) {
    'use strict';

    var _ = require("underscore")._;

    function registerHandlers() {
        app.post('/api/achievements/createAchievement', function (request, response) {
            cleanUpGoalList(request.body.goalList, function(goalList) {
                achievementInstance.createAchievement(request.session.currentUser._id, request.body.achievementTitle, request.body.achievementDescription, request.body.achievementImage, goalList, function() {
                    return requestHandlers.respondWithJson(response, {url: thSettings.getDomain() + 'app/achievements'});
                });
            });
        });

        function cleanUpGoalList(dirtyGoalList, callback) {
            var cleanGoalList = [];
            _.each(dirtyGoalList, function (goal) {
                if (goal.title && goal.quantity) {
                    cleanGoalList.push(goal);
                }
            });
            callback(cleanGoalList);
        }
    }

    return {
        registerHandlers : registerHandlers
    };
}