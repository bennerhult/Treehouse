module.exports = function (app, templates, requestHandlers, newsfeed) {
    'use strict';

    var _ = require("underscore")._;

    function registerHandlers() {
        app.get('/app/newsfeed', function (request, response) {
            templates.serveHtmlRaw(response, './server-templates/treehouse.html', {});
        });
        app.post('/api/newsfeed/init', function (request, response) {
            newsfeed.getNewsfeed(request.session.currentUser._id, function(newsfeedFromServer) {
                if(newsfeedFromServer && newsfeedFromServer.newsItems) {
                    _.each(newsfeedFromServer.newsItems, function (n) {
                        if(n.eventType != 'info') {
                            n.newsJson = JSON.parse(n.newsJson);
                        }
                    });
                }
                return requestHandlers.respondWithJson(response, { newsItems : newsfeedFromServer.newsItems });
            });
        });
    }

    return {
        registerHandlers
    };
};