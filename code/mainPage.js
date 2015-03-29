module.exports = function (app, requestHandlers, templates, friendship) {
    'use strict';

    function registerHandlers() {
        app.post('/api/init', function (request, response) {
            if (request.session && request.session.currentUser) {
                friendship.getNrOfRequests(request.session.currentUser._id, function (count) {
                    return requestHandlers.respondWithJson(response, {
                        currentUser: request.session.currentUser,
                        nrOfIncomingFriendRequests: count
                    });
                })

            }
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}
