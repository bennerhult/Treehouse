module.exports = function (app, templates, thSettings, user, loginToken, email, auth, url) {
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

        app.get('/signin2', function (request, response){
            var url_parts = url.parse(request.url, true)
            var email = url_parts.query.email.toLowerCase()
            var token = url_parts.query.token
            auth.authenticate(email, token, function (err, isAuthenticated, data) {
                if (err) {
                     response.redirect(302, thSettings.getDomain() + 'error?t=login'); //TODO: Build this page with the old error message under the login template
                } else if (!isAuthenticated) {
                    response.redirect(302, thSettings.getDomain() + 'login2');
                } else {
                    request.session.currentUser = data.user;
                    response.cookie('rememberme', loginToken.cookieValue(data.token), { expires: new Date(Date.now() + 12 * 604800000), path: '/' }) //604800000 equals one week
                    response.redirect(302, thSettings.getDomain() + 'newsfeed2');
                }
            });
        });

        app.post('/api/login2/signinFB', function (request, response){
            if(!request.body.email) {
                //TODO how to handle this
            }
            var username = request.body.email.toLowerCase();
            user.User.findOne({ username: username }, function(err, myUser) {
                if (!myUser) {
                    //TODO: create new user
                }

                request.session.currentUser = myUser;
                response.cookie('rememberme', loginToken.cookieValue(data.token), { expires: new Date(Date.now() + 12 * 604800000), path: '/' }) //604800000 equals one week
                response.redirect(302, thSettings.getDomain() + 'newsfeed2');
            })
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
                    return thSettings.getDomain() + "signin2?email=" + normalizedUsername + "&token=" + token;
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
                                 respondWithJson(response, { isNewUser : false });
                             }
                        );
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
                                respondWithJson(response, { isNewUser : true });
                            }
                        );
                    };
                }

                loginToken.createToken(normalizedUsername, onTokenCreated);
            });
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};
