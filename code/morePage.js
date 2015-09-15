module.exports = function (app, templates, requestHandlers, user, thSettings, email) {
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

        app.post('/api/more/setUsernames', function (request, response) {
            if(!request.body.firstName || request.body.lastName) {
                requestHandlers.respondWithJson(response, { errCode : 1 });
            }
            user.setUsernames(request.session.currentUser._id , request.body.firstName, request.body.lastName, function(error) {});
        });

        app.post('/api/more/upgradeToIssuer', function (request, response) {
            if(!request.body.username) {
                requestHandlers.respondWithJson(response, { errCode : 1 });
            }
            var text = "User " + request.body.username + " wants to be an issuer. Make it so. 1. Confirm that the user is really the Issuer and willing to pay the corresponding fees. 2. Change user to issuer=true 3. Give the user an issuerName."
            email.emailUser('staff@treehouse.io', 'Issuer Request', text, text, function (error) {
                if (error) {
                    response.writeHead(404, {'content-type': 'application/json'});
                } else {
                    response.writeHead(200, {'content-type': 'application/json'});
                }
                response.end('\n', 'utf-8');
            });
        });
    }

    return {
        registerHandlers
    };
}