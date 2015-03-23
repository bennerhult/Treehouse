module.exports = function (app, templates, requestHandlers, achievementInstance, user) {
    'use strict';

    function registerHandlers() {
        app.get('/public/achievementInstance/:achievementInstanceId', function (request, response) {
            templates.serveHtmlRaw(response, './server-templates/treehouse.html', {});
        });

        app.post('/api/publicAchievement/init', function (request, response) {
            achievementInstance.getPublicAchievement(request.body.achievementInstanceId, function(achievementInstance) {
                if (achievementInstance) {
                    user.User.findById(achievementInstance.createdBy, function(err2, createdBy) {
                        return requestHandlers.respondWithJson(response, { achievementInstance: achievementInstance,  createdBy: createdBy});
                    });
                } else {
                    return requestHandlers.respondWithJson(response, {});
                }
            });
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}