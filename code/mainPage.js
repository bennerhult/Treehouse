module.exports = function (app, requestHandlers, templates) {
    'use strict';

    function registerHandlers() {
        app.post('/api/init', function (request, response) {
            if (request.session && request.session.currentUser) {
                return requestHandlers.respondWithJson(response, { currentUser: request.session.currentUser});
            }
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}