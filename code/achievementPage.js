module.exports = function (app, templates, requestHandlers, user, progress, moment, shareholding, achievementInstance, thSettings) {
    'use strict';

    function registerHandlers() {
        app.post('/api/achievements/progress', function (request, response) {
            achievementInstance.progress( request.body.goal, request.body.achievement, function(updatedAchievementInstance) {
                requestHandlers.respondWithJson(response, { updatedAchievementInstance : updatedAchievementInstance });
            });
        });

        app.post('/api/achievements/publicizeAchievement', function (request, response) {
            achievementInstance.publicize(request.body.achievementInstance, request.session.currentUser._id, function() {});
        });

        app.post('/api/achievements/deleteAchievement', function (request, response) {
            achievementInstance.remove(request.body.achievementInstance, request.session.currentUser._id, function() {});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}