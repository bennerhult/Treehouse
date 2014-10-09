module.exports = function (app, templates, thSettings, newsfeed) {
    'use strict';

    function respondWithJson(response, data) {
        response.writeHead(200, {'content-type': 'application/json' });
        response.write(JSON.stringify(data));
        response.end('\n', 'utf-8');
    }

    function registerHandlers() {
        app.get('/newsfeed2', function (request, response) {
            if (!request.session || !request.session.currentUser) { //TODO: Common infrastructure for this.
                response.redirect('/preLogin');
                return;
            }
            templates.serveHtmlRaw(response, './server-templates/newsfeed.html', {});
        });
        app.post('/api/newsfeed/init', function (request, response) {
            if (!request.session || !request.session.currentUser) {
                return respondWithJson(response, { errMsg : 'Not logged in' });
            }
            var userId = request.session.currentUser._id;
            newsfeed.getNewsfeed(userId, function(newsfeedFromServer) {
                //TODO: Look up email and switch userId to email
                return respondWithJson(response, { userEmail : userId, newsItems : newsfeedFromServer.newsItems });
            });
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};
