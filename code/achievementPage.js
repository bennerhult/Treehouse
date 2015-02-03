module.exports = function (app, templates, requestHandlers, user, progress, moment, shareholding, achievement, thSettings) {
    'use strict';

    function registerHandlers() {
        app.post('/api/achievements/deleteAchievement', function (request, response) {
            achievement.remove(request.body.achievementId, request.session.currentUser._id, function() {});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}