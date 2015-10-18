module.exports = function (app, templates, requestHandlers, progress, moment, shareholding, achievementInstance) {
    'use strict';

    function registerHandlers() {
        app.get('/app/achievements', function (request, response) {
            templates.serveHtmlRaw(response, './server-templates/treehouse.html', {});
        });

        app.post('/api/achievements/init', function (request, response) {
            achievementInstance.getAchievementList(request.session.currentUser._id, function(progressList, unlockedList) {
                shareholding.getSharedAchievementNotifications(request.session.currentUser._id, function (notificationList) {
                    return requestHandlers.respondWithJson(response, { notificationList: notificationList, progressList: progressList,  unlockedList: unlockedList});
                });
            });
        });
        
        app.post('/api/achievements/editAchievement', function (request, response) {
            achievementInstance.editAchievement(request.session.currentUser._id, request.body.achievementId, request.body.changes, function (error) {
                if(error) {
                    throw error;
                }
                return requestHandlers.respondWithJson(response, {});
            })
        });
    }

    return {
        registerHandlers
    };
}