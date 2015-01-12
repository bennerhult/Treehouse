module.exports = function (app, requestHandlers, templates) {
    'use strict';

    function registerHandlers() {
        app.post('/api/init', function (request, response) {
            if (request.session && request.session.currentUser) {
                requestHandlers.getPrettyNameIdAndImageURL(request.session.currentUser._id, function(prettyName, myUserId, userImageURL) {
                    return requestHandlers.respondWithJson(response, { prettyName : prettyName, userImageURL : userImageURL});
                });
            }
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}