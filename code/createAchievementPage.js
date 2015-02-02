module.exports = function (app, templates, requestHandlers, user, progress, moment, shareholding, achievement, thSettings) {
    'use strict';

    function registerHandlers() {
        //TODO ett achievement ska bara dyka upp en gång, oavsett antalet progresses
        //TODO öppna achievements efter sparad
        //TODO verifiera inmatningsdata
        //TODO spara bara progresses (i achievement.js) om achievementet sparas

        app.post('/api/achievements/createAchievement', function (request, response) {
           // var goals = [{title: 'testTitle', quantity: 1}, {title: 'testTitle2', quantity: 5}];
            var goals = [{title: 'testTitle', quantity: 1}];
            achievement.createAchievement2(request.session.currentUser._id, request.body.achievementTitle, request.body.achievementDescription, "../content/img/achievementImages/48.png", goals, function() {
                return requestHandlers.respondWithJson(response, {url: thSettings.getDomain() + 'app/achievements'});
            });
        });
    }

    return {
        registerHandlers : registerHandlers
    };



}