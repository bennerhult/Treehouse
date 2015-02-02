module.exports = function (app, templates, requestHandlers, user, progress, moment, shareholding, achievement, url) {
    'use strict';

    function registerHandlers() {
        app.post('/api/achievements/init', function (request, response) {
            achievement.getAchievementList(request.session.currentUser._id, function(achievementList) {
                return requestHandlers.respondWithJson(response, { achievementList: achievementList });
            });
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}