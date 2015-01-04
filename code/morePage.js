module.exports = function (app, templates, requestHandlers, thSettings) {
    'use strict';

    function respondWithJson(response, data) {
        response.writeHead(200, {'content-type': 'application/json' });
        response.write(JSON.stringify(data));
        response.end('\n', 'utf-8');
    }

    function registerHandlers() {
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