module.exports = function (app, requestHandlers, templates) {
    'use strict';

    function registerHandlers() {
        app.post('/api/init', function (request, response) {
            if (request.session &&request.session.currentUser) {
                requestHandlers.getPrettyNameIdAndImageURL(request.session.currentUser._id, function(prettyName, myUserId, userImageURL) {
                    return requestHandlers.respondWithJson(response, { prettyName : prettyName, userImageURL : userImageURL});
                });
            }
        });

        app.get('/app/th', function (request, response) {
            templates.serveHtmlRaw(response, './server-templates/treehouse.html', {});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}