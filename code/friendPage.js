module.exports = function (app, friendship, user, requestHandlers) {
    'use strict';

    function registerHandlers() {
        app.post('/api/friend/init', function (request, response) {
            var userId = request.session.currentUser._id
            var friendUserName = request.body.username

            user.User.findOne({ username: friendUserName }, function(err, friendUser) {
                if(err) {
                    throw err;
                }
                var u = { }
                if(friendUser) {
                    u.friend = {
                        username : friendUser.username,
                        imageURL : friendUser.imageURL
                    }
                }
                requestHandlers.respondWithJson(response, u)
            })
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};
