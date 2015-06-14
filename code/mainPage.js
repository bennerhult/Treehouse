module.exports = function (app, requestHandlers, templates, friendship, shareholding) {
    'use strict';

    function registerHandlers() {
        app.post('/api/init', function (request, response) {
            if (request.session && request.session.currentUser) {
                friendship.getNrOfRequests(request.session.currentUser._id, function (friendRequestCount) {
                    shareholding.getNrOfChallenges(request.session.currentUser._id, function (nrOfIncomingChallenges) {
                        return requestHandlers.respondWithJson(response, {
                            currentUser: request.session.currentUser,
                            nrOfIncomingFriendRequests: friendRequestCount,
                            nrOfIncomingChallenges: nrOfIncomingChallenges,
                        });
                     });   
                });
            }
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};