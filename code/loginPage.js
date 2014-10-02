module.exports = function (app, templates, thSettings, user, loginToken, email) {
    'use strict';

    function respondWithJson(response, data) {
        response.writeHead(200, {'content-type': 'application/json' });
        response.write(JSON.stringify(data));
        response.end('\n', 'utf-8');
    }

    function registerHandlers() {
        app.get('/login2', function (request, response){
            templates.serveHtmlRaw(response, './server-templates/login.html');
        });
        app.post('/api/login2/authenticate', function (request, response) {
            if(!request.body.email) {
                respondWithJson(response, { errMsg : 'Login failed (1)' });
                return;
            }
            var username = request.body.email.toLowerCase();
            user.User.findOne({ username: username }, function(err, myUser) {
                var normalizedUsername = username;
                if(myUser) {
                    normalizedUsername = myUser.username;
                }

                function createSignupLink(token) {
                    return thSettings.getDomain() + "signin?email=" + normalizedUsername + "&token=" + token
                }

                var onTokenCreated;
                if(thSettings.isAutoLoginEnabled()) {
                    //Local testing - skip email and redirect to signup link directly
                    onTokenCreated = function (myToken) {
                         if (myUser) {
                             respondWithJson(response, { url : createSignupLink(myToken.token), isNewUser : false });
                         } else {
                             respondWithJson(response, { url : createSignupLink(myToken.token), isNewUser : true });
                         }
                    };
                } else if (myUser) {
                    //Existing user
                    onTokenCreated = function (myToken) {
                        email.emailUser(
                            username,
                            'Sign in to Treehouse',
                            "<html>Click <a href='" + createSignupLink(myToken.token) + "'>here</a> to sign in to Treehouse.</html>",
                            'Go to ' + createSignupLink(myToken.token) +  ' to sign in to Treehouse!',
                             function() {
                                 respondWithJson(response, { isNewUser : false  })
                             }
                        )
                    };
                } else {
                    //New user
                    onTokenCreated = function (myToken) {
                        email.emailUser(
                            username,
                            'Welcome  to Treehouse',
                            "<html>Click <a href='" + createSignupLink(myToken.token) + "'>here</a> to start using Treehouse.</html>",
                            'Go to ' + createSignupLink(myToken.token) + ' to start using Treehouse!',
                            function() {
                                respondWithJson(response, { isNewUser : true  })
                            }
                        )
                    };
                }

                loginToken.createToken(normalizedUsername, onTokenCreated);
            })
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};
