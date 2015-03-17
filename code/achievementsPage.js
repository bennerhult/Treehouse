module.exports = function (app, templates, requestHandlers, user, progress, moment, shareholding, achievementInstance) {
    'use strict';

    function registerHandlers() {
        app.get('/app/achievements', function (request, response) {
            templates.serveHtmlRaw(response, './server-templates/treehouse.html', {});
        });

        app.post('/api/achievements/init', function (request, response) {
            achievementInstance.getAchievementList(request.session.currentUser._id, function(progressList, unlockedList) {
                return requestHandlers.respondWithJson(response, { progressList: progressList,  unlockedList: unlockedList});
            });
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}