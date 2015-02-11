module.exports = function (app, templates, requestHandlers, user, progress, moment, shareholding, achievementInstance, thSettings) {
    'use strict';

    function registerHandlers() {
        app.post('/api/achievements/progress', function (request, response) {
            achievementInstance.progress( request.body.goal, request.body.achievement, function(updatedAchievementInstance) {
                //TODO XXX achievementInstance = updatedAchievementInstance;
            });
        });

        app.post('/api/achievements/deleteAchievement', function (request, response) {
            //TODO ta bort både instance och moderachievement
            achievementInstance.remove(request.body.achievementId, request.session.currentUser._id, function() {});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}