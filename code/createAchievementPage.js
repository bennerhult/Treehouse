module.exports = function (app, templates, requestHandlers, user, progress, moment, shareholding, achievement, thSettings) {
    'use strict';

    function registerHandlers() {
        app.post('/api/achievements/createAchievement', function (request, response) {
           // var goals = [{title: 'testTitle', quantity: 1}, {title: 'testTitle2', quantity: 5}];
            var goals = [{title: 'testTitle', quantity: 1}];
            achievement.createAchievement2(request.session.currentUser._id, request.body.achievementTitle, request.body.achievementDescription, request.body.achievementImage, goals, function() {
                return requestHandlers.respondWithJson(response, {url: thSettings.getDomain() + 'app/achievements'});
            });
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}