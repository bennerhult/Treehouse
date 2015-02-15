module.exports = function (app, friendship) {
    'use strict';

    function registerHandlers() {
        app.get('/api/friends/init', function (request, response) {
            var userId = request.session.currentUser._id
            friendship
                .Friendship
                .find()
                .or([{ friend1_id: userId }, { friend2_id: userId }])
                .exec(function(err, result) {
                    if(err) {
                        throw err;
                    }
                    console.log(result);
                });
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};
