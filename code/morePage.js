module.exports = function (app, templates, requestHandlers, user, thSettings) {
    'use strict';

    function registerHandlers() {
        app.post('/api/more/signout', function (request, response) {
            if (request.session) {
                request.session.destroy();
            }
            return requestHandlers.respondWithJson(response, {url: thSettings.getDomain() + 'app/signin'});
        });

        app.post('/api/more/setUserImage', function (request, response) {
            if(!request.body.imageURL) {
                requestHandlers.respondWithJson(response, { errCode : 1 });
            }
            user.setImageURL(request.session.currentUser._id , request.body.imageURL, function(error) {
                return requestHandlers.respondWithJson(response, {error: error});
            });
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}