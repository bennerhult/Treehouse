module.exports = function (app, requestHandlers, templates) {
    'use strict';

    function registerHandlers() {
        app.post('/api/init', function (request, response) {
            if (request.session && request.session.currentUser) {
                requestHandlers.getUserData(request.session.currentUser._id, function(firstName, lastName, username, imageURL) {
                    return requestHandlers.respondWithJson(response, { firstName: firstName, lastName: lastName, username: username, userImageURL: imageURL});
                });
            }
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}