module.exports = function (app, templates, thSettings, user, signinToken, email, auth, url) {
    'use strict';

    function respondWithJson(response, data) {
        response.writeHead(200, {'content-type': 'application/json' });
        response.write(JSON.stringify(data));
        response.end('\n', 'utf-8');
    }

    function registerHandlers() {
        app.get('/signin2', function (request, response){
            templates.serveHtmlRaw(response, './server-templates/signin.html');
        });

        app.get('/signinByEmail', function (request, response){
            var url_parts = url.parse(request.url, true);
            var email = url_parts.query.email.toLowerCase();
            var token = url_parts.query.token;
            auth.authenticate(email, token, function (err, isAuthenticated, data) {
                if (err) {
                    //TODO show error message on page
                    response.redirect(302, thSettings.getDomain() + 'error?t=login');
                } else if (!isAuthenticated) {
                    response.redirect(302, thSettings.getDomain() + 'signin2');
                } else {
                    sendUserToDefaultPage(request, response, data.user);
                }
            });
        });

        app.get('/fbAppConnect2', function (request, response){
            var url_parts = url.parse(request.url, true);
            var code = url_parts.query.code;
            var accessTokenLink= 'https://graph.facebook.com/oauth/access_token?client_id=480961688595420&client_secret=c0a52e2b21f053355b43ffb704e3c555&redirect_uri=' + thSettings.getDomain()+ 'fbAppConnect2&code=' + code;
            var requestModule = require('request');
            requestModule.get(accessTokenLink, function (accessTokenError, accessTokenResponse, accessTokenBody) {
                if (!accessTokenError && accessTokenResponse.statusCode == 200) {
                    var accessToken  = accessTokenBody.substring(accessTokenBody.indexOf('='))
                    var graphLink = 'https://graph.facebook.com/me?access_token' + accessToken;
                    requestModule.get(graphLink, function (graphError, graphResponse, graphBody) {
                        if (!graphError && graphResponse.statusCode == 200) {
                            var graph_parts = JSON.parse(graphBody);
                            var email  = graph_parts.email;
                            user.User.findOne({ username: email }, function(err,myUser) {
                                if (!myUser) {
                                    user.createUser(email, function (newUser, err) {
                                        if (err) {
                                            response.redirect(302, thSettings.getDomain() + 'error?t=login'); //TODO: Build this page with the old error message under the login template
                                        } else {
                                            sendUserToDefaultPage(request, response, newUser);
                                        }
                                    });
                                } else {
                                    sendUserToDefaultPage(request, response, myUser);
                                }
                            });
                        }
                    });
                }
            });
        });

        function createSigninLink(email, token) {
            return thSettings.getDomain() + "signinByEmail?email=" + email + "&token=" + token;
        }

        function sendUserToDefaultPage (request, response, user) {
            request.session.currentUser = user;
            response.redirect(302, thSettings.getDomain() + 'app/newsfeed');
        }

        app.post('/api/signin/signinFB', function (request, response){
            if (!request.body.email) {
                return;
            }
            var username = request.body.email.toLowerCase();
            var onTokenCreated = function(myToken) {
                user.User.findOne({ username: username }, function (err, myUser) {
                   if (!myUser) {
                        user.createUser(username, function (newUser, err) {
                            if (err) {
                                return;
                            } else {
                                request.session.currentUser = newUser;
                                respondWithJson(response, {url: thSettings.getDomain() + 'app/newsfeed'});
                            }
                        });
                    } else {
                       request.session.currentUser = myUser;
                       respondWithJson(response, {url: thSettings.getDomain() + 'app/newsfeed'});
                   }
                })
            }
            signinToken.createToken(username, onTokenCreated);
        });

        app.post('/api/signin/authenticate', function (request, response) {
            if(!request.body.email) {
                respondWithJson(response, { errCode : 1 });
                return;
            }
            var username = request.body.email.toLowerCase();
            user.User.findOne({ username: username }, function(err, myUser) {
                var normalizedUsername = username;
                if(myUser) {
                    normalizedUsername = myUser.username;
                }
                var onTokenCreated;
                if(thSettings.isAutoSigninEnabled()) {
                    //Local testing - skip email and redirect to sign up link directly
                    onTokenCreated = function (myToken) {
                         if (myUser) {
                             respondWithJson(response, { url : createSigninLink(normalizedUsername, myToken.token), isNewUser : false });
                         } else {
                             respondWithJson(response, { url : createSigninLink(normalizedUsername, myToken.token), isNewUser : true });
                         }
                    };
                } else if (myUser) {
                    //Existing user
                    onTokenCreated = function (myToken) {
                        email.emailUser(
                            username,
                            'Sign in to Treehouse',
                            "<html>Click <a href='" + createSigninLink(normalizedUsername, myToken.token) + "'>here</a> to sign in to Treehouse.</html>",
                            'Go to ' + createSigninLink(normalizedUsername, myToken.token) +  ' to sign in to Treehouse!',
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
                            "<html>Click <a href='" + createSigninLink(normalizedUsername, myToken.token) + "'>here</a> to start using Treehouse.</html>",
                            'Go to ' + createSigninLink(normalizedUsername, myToken.token) + ' to start using Treehouse!',
                            function() {
                                respondWithJson(response, { isNewUser : true });
                            }
                        );
                    };
                }
                signinToken.createToken(normalizedUsername, onTokenCreated);
            });
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};