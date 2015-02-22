/*
 Some notes about what this does.

 It makes up a test user and returns a login url you can use to become that user.

 Don't try to login the normal way as the emails generated for this user are all of the form testuser+<guid>@treehouse.io which does not exist.

 Future improvements:
 - Add a bunch of friends
 - Add pending incoming friend requests
 - Add pending outgoing friend requests
 - Generate some fake names from name lists to test searching
 - Add some achievements
 - Add some achivement progress
*/
module.exports = function (user, loginToken, thSettings) {
    "use strict";

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    function createNewTestUser(cb) {
        //TODO: Swap the uid for some name generation thing that makes is shorter and somewhat readable
        var email = 'testuser+' + guid() + '@treehouse.io';
        user.createUser(email, function (user, err) {
            if(err) {
                throw err;
            }
            loginToken.createToken(email, function (token) {
                var loginUrl = thSettings.getDomain() + "signinByEmail?email=" + encodeURIComponent(email) + "&token=" + encodeURIComponent(token.token);
                cb(loginUrl);
            });

        });
    }

    return {
        createNewTestUser : createNewTestUser
    };
};
