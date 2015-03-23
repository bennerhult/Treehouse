module.exports = function (app, templates, requestHandlers, achievementInstance) {
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
            achievementInstance.getCreatedBy(request.body.achievementInstanceId, function(createdBy) {
                return requestHandlers.respondWithJson(response, { createdBy: createdBy});
            });
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}