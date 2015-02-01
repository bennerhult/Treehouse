module.exports = function (app, templates, requestHandlers, user, progress, moment, shareholding, achievement, thSettings) {
    'use strict';

    function registerHandlers() {
        //TODO öppna achievements efter sparad
        //TODO verifiera inmatningsdata
        app.post('/api/achievements/createAchievements', function (request, response) {
            var goals = [{title: 'testTitle', quantity: 1}, {title: 'testTitle2', quantity: 5}];
            achievement.createAchievement2(request.session.currentUser._id, "title", "description", "../content/img/achievementImages/48.png", goals, function() {
                return requestHandlers.respondWithJson(response, {url: thSettings.getDomain() + 'app/achievements'});
            });
        });
    }

    return {
        registerHandlers : registerHandlers
    };



}