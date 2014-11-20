module.exports = function (app, templates, thSettings, user, loginToken, email, auth, url) {
    'use strict';

    //TODO make sure an unauthenticated user does not get access
    function respondWithJson(response, data) {
        response.writeHead(200, {'content-type': 'application/json' });
        response.write(JSON.stringify(data));
        response.end('\n', 'utf-8');
    }

    function registerHandlers() {
        app.get('/login2', function (request, response){
            //TODO fix rememberme function!
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
                    sendUserToDefaultPage(request, response, data.user, data.token)
                }
            });
        });

        //TODO create user if needed
        app.get('/fbAppConnect2', function (request, response){
            var url_parts = url.parse(request.url, true)
            var code = url_parts.query.code
            var accessTokenLink= 'https://graph.facebook.com/oauth/access_token?client_id=480961688595420&client_secret=c0a52e2b21f053355b43ffb704e3c555&redirect_uri=' + thSettings.getDomain()+ 'fbAppConnect2&code=' + code
            var requestModule = require('request');
            requestModule.get(accessTokenLink, function (accessTokenError, accessTokenResponse, accessTokenBody) {
                if (!accessTokenError && accessTokenResponse.statusCode == 200) {
                    var accessToken  = accessTokenBody.substring(accessTokenBody.indexOf('='))
                    var graphLink = 'https://graph.facebook.com/me?access_token' + accessToken
                    requestModule.get(graphLink, function (graphError, graphResponse, graphBody) {
                        if (!graphError && graphResponse.statusCode == 200) {
                            var graph_parts = JSON.parse(graphBody)
                            var email  = graph_parts.email
                            user.User.findOne({ username: email }, function(err,myUser) {
                                if (!myUser) {
                                    user.createUser(email, function (newUser, err) {
                                        if (err) {
                                            response.redirect(302, thSettings.getDomain() + 'error?t=login'); //TODO: Build this page with the old error message under the login template
                                        } else {
                                            sendUserToDefaultPage(request, response, newUser, accessToken)
                                        }
                                    });
                                } else {
                                    sendUserToDefaultPage(request, response, myUser, accessToken);
                                }
                            })
                        }
                    })
                }
            })
        });

        function createSignupLink(email, token) {
            return thSettings.getDomain() + "signin2?email=" + email + "&token=" + token;
        }

        function sendUserToDefaultPage (request, response, user, token) {
            setRememberMeCookie(response, token);
            request.session.currentUser = user;
            response.redirect(302, thSettings.getDomain() + 'newsfeed2');
        }

        function setRememberMeCookie(response, token) {
            response.cookie('rememberme', loginToken.cookieValue(token), { expires: new Date(Date.now() + 12 * 604800000), path: '/' }); //604800000 equals one week
        }

        app.post('/api/login2/signinFB', function (request, response){
            if (!request.body.email) {
                respondWithJson(response, { errMsg : 'Login failed (2)' });
                return;
            }
            var username = request.body.email.toLowerCase();
            var onTokenCreated = function(myToken) {
                setRememberMeCookie(response, myToken.token);
                user.User.findOne({ username: username }, function (err, myUser) {
                   if (!myUser) {
                        user.createUser(username, function (newUser, err) {
                            if (err) {
                                //TODO show error message on page
                                respondWithJson(response, {errMsg: 'There was a problem creating your account. Contact staff@treehouse.io for more information.'})
                            } else {
                                request.session.currentUser = newUser;
                                respondWithJson(response, {url: thSettings.getDomain() + 'newsfeed2'})
                            }
                        });
                    } else {
                       request.session.currentUser = myUser;
                       respondWithJson(response, {url: thSettings.getDomain() + 'newsfeed2'})
                   }
                })
            }
            loginToken.createToken(username, onTokenCreated);
        });

        app.post('/api/login2/authenticate', function (request, response) {
            if(!request.body.email) {
                respondWithJson(response, { errMsg : 'Login failed (3)' });
                return;
            }
            var username = request.body.email.toLowerCase();
            user.User.findOne({ username: username }, function(err, myUser) {
                var normalizedUsername = username;
                if(myUser) {
                    normalizedUsername = myUser.username;
                }

                var onTokenCreated;
                if(thSettings.isAutoLoginEnabled()) {
                    //Local testing - skip email and redirect to signup link directly
                    onTokenCreated = function (myToken) {
                         if (myUser) {
                             respondWithJson(response, { url : createSignupLink(normalizedUsername, myToken.token), isNewUser : false });
                         } else {
                             respondWithJson(response, { url : createSignupLink(normalizedUsername, myToken.token), isNewUser : true });
                         }
                    };
                } else if (myUser) {
                    //Existing user
                    onTokenCreated = function (myToken) {
                        email.emailUser(
                            username,
                            'Sign in to Treehouse',
                            "<html>Click <a href='" + createSignupLink(normalizedUsername, myToken.token) + "'>here</a> to sign in to Treehouse.</html>",
                            'Go to ' + createSignupLink(normalizedUsername, myToken.token) +  ' to sign in to Treehouse!',
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
                            "<html>Click <a href='" + createSignupLink(normalizedUsername, myToken.token) + "'>here</a> to start using Treehouse.</html>",
                            'Go to ' + createSignupLink(normalizedUsername, myToken.token) + ' to start using Treehouse!',
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