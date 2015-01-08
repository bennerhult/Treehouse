module.exports = function (app, templates, requestHandlers, thSettings) {
    'use strict';

    function registerHandlers() {
        app.post('/api/more/signout', function (request, response) {
            if (request.session) {
                request.session.destroy();
            }
            return requestHandlers.respondWithJson(response, {url: thSettings.getDomain() + 'app/signin'});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};