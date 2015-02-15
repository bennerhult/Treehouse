module.exports = function (app, friendship, user, requestHandlers) {
    'use strict';

    function registerHandlers() {
        app.post('/api/friends/init', function (request, response) {
            var userId = request.session.currentUser._id
            friendship
                .Friendship
                .find([{ friend1_id: userId }])
                .exec(function(err, result) {
                    if(err) {
                        throw err;
                    }
                    var friendUsersFilter = [];
                    for(var i=0; i<result.length; i++) {
                        if(result[i].confirmed) {
                            friendUsersFilter.push({ _id : result[i].friend2_id });
                        }
                    }
                    user.User.find().or(friendUsersFilter).exec(function(err, result) {
                        if(err) {
                            throw err;
                        }
                        var r = [];
                        for(var j=0; j<result.length; j++) {
                            r.push({ imageURL : result[j].imageURL, username : result[j].username });
                        }
                        requestHandlers.respondWithJson(response, r);
                    });
                });
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};
