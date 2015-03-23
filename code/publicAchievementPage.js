module.exports = function (app, templates, requestHandlers, achievementInstance, user) {
    'use strict';

    function registerHandlers() {
        app.get('/public/achievementInstance/:achievementInstanceId', function (request, response) {
            templates.serveHtmlRaw(response, './server-templates/treehouse.html', {});
        });

        app.post('/api/publicAchievement/init', function (request, response) {
            achievementInstance.getPublicAchievement(request.body.achievementInstanceId, function(achievementInstance) {
                return requestHandlers.respondWithJson(response, { achievementInstance: achievementInstance});
            });
        });

        app.post('/api/publicAchievement/initCreatedBy', function (request, response) {
            user.User.findById(request.body.userId, function(err2, createdBy) {
                return requestHandlers.respondWithJson(response, { createdBy: createdBy});
            });
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}