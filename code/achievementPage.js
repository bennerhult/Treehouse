module.exports = function (app, templates, requestHandlers, user, progress, moment, shareholding, achievementInstance, thSettings) {
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
    }

    return {
        registerHandlers : registerHandlers
    };
}