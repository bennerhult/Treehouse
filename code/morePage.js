module.exports = function (app, templates, requestHandlers, thSettings) {
    'use strict';

    function respondWithJson(response, data) {
        response.writeHead(200, {'content-type': 'application/json' });
        response.write(JSON.stringify(data));
        response.end('\n', 'utf-8');
    }

    function registerHandlers() {
        app.get('/app/more', function (request, response){
            templates.serveHtmlRaw(response, './server-templates/more.html', {});
        });
        app.post('/api/more/init', function (request, response) {
            var userId = request.session.currentUser._id;
            requestHandlers.getPrettyNameIdAndImageURL(userId, function(prettyName, myUserId, userImageURL) {
                return respondWithJson(response, { prettyName : prettyName, userImageURL : userImageURL });
            });
        });
        app.post('/api/more/signout', function (request, response) {
            if (request.session) {
                request.session.destroy();
            }
            return respondWithJson(response, {url: thSettings.getDomain() + 'app/signin2'});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};