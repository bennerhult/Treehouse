module.exports = function (app, requestHandlers, templates) {
    'use strict';

    function respondWithJson(response, data) {
        response.writeHead(200, {'content-type': 'application/json' });
        response.write(JSON.stringify(data));
        response.end('\n', 'utf-8');
    }

    function registerHandlers() {
        app.post('/api/init', function (request, response) {
            var userId = request.session.currentUser._id;
            requestHandlers.getPrettyNameIdAndImageURL(userId, function(prettyName, myUserId, userImageURL) {
                return respondWithJson(response, { prettyName : prettyName, userImageURL : userImageURL});
            });
        });

        app.get('/app/th', function (request, response) {
            templates.serveHtmlRaw(response, './server-templates/treehouse.html', {});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}