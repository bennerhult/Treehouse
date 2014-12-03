var fs = require('fs'),
    url = require('url'),
    express = require('express'),
    moment = require('moment'),
    connectmongo = require('connect-mongo'),
    _ = require("underscore")._,
    mongoose = require('mongoose'),
    thSettings = require('./code/thSettings.js'),
    email = require('./code/email.js'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

var db_uri = 'mongodb://localhost:27017/test';
var domain = '';
var app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var MongoStore = require('connect-mongo')(session);

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.indexOf(str) == 0;
    }
}

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
    domain = 'http://localhost:1337/'
    console.log("Treehouse in development mode.")
    thSettings.init({
        envName : 'development',
        autoSignin : process.env.TH_AUTOSIGNIN && process.env.TH_AUTOSIGNIN.toLowerCase() === 'true',
        domain : domain
    });
} else if ('test' == env)  {
    console.log("Treehouse in test mode (v2).")
    if(!process.env.TH_DOMAIN) {
        throw "Missing environment variable TH_DOMAIN which is required in test. Should be the equilvalent of what is 'http://www.treehouse.io' in production";
    }
    if(!process.env.DB_URI) {
        throw "Missing environment variable DB_URI which is required in test. Should be the equilvalent of what is 'mongodb://localhost:27017/test' in when developing locally";
    }
    domain = process.env.TH_DOMAIN;
    db_uri = process.env.DB_URI;
    thSettings.init({
        envName : 'test',
        domain : domain
    });
} else if ('production' == env) {
    domain = 'http://www.treehouse.io/'
    console.log("Treehouse in prod mode.")
    db_uri=process.env.DB_URI
    thSettings.init({
        envName : 'production',
        domain : domain
    });
}

mongoose.connect(db_uri)
app.use(cookieParser())
app.use(session({
    store: new MongoStore({
        url: db_uri,
        auto_reconnect: true,
        clear_interval: 3600
    }, function () {
        console.log("DB connection open.");
    }),
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: new Date(Date.now() + 2 * 604800000)},
    secret: 'jkdWs23321kA3kk3kk3kl1lklk1ajUUUAkd378043!sa3##21!lk4'
}))

//Database models
var user = require('./models/user.js'),
    achievement = require('./models/achievement.js'),
    latestAchievement = require('./models/latestAchievement.js'),
    goal = require('./models/goal.js'),
    progress = require('./models/progress.js'),
    friendship = require('./models/friendship.js'),
    shareholding = require('./models/shareholding.js'),
    loginToken = require('./models/loginToken.js'),
    requestHandlers = require('./code/requestHandlers.js')(thSettings, user),
    newsfeed = require('./models/newsfeed.js'),
    staticFiles = require('./code/staticFiles.js');

function authenticateFromLoginToken(request, response) {
    if (request.cookies.rememberme)  {
        var cookie = JSON.parse(request.cookies.rememberme)
        loginToken.LoginToken.findOne({ email: cookie.email }, function(err,token) {
            if (!token) {
                response.writeHead(404, {'content-type': 'application/json' })
                response.write(JSON.stringify(""))
                response.end('\n', 'utf-8')
            } else {
                user.User.findOne({ username: token.email.toLowerCase() }, function(err, user) {
                    if (user) {
                        request.session.currentUser = user
                        friendship.getNrOfRequests(user._id, function (nrOfFriendShipRequests) {
                            token.token = loginToken.randomToken();
                            token.save(function() {
                                request.session.nrOfFriendShipRequests = nrOfFriendShipRequests;
                                response.cookie('rememberme', loginToken.cookieValue(token), { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
                                response.writeHead(200, {'content-type': 'application/json' });
                                response.write(JSON.stringify(user._id));
                                response.end('\n', 'utf-8');
                            });
                        })
                    } else {
                        response.writeHead(404, {'content-type': 'application/json' });
                        response.write(JSON.stringify("Bummer! We cannot find you in our records. Contact us at staff@treehouse.io if you want us to help you out."));
                        response.end('\n', 'utf-8');
                    }
                })
            }
        })
    }  else {
        response.writeHead(404, {'content-type': 'application/json' });
        response.write(JSON.stringify(""));   //typical first sign in
        response.end('\n', 'utf-8');
    }
}

var port = process.env.PORT || 1337;
app.listen(port);
console.log('Treehouse server started on port ' + port);

var Router = require('router');
var publiclyAvailable = new Router();
var requireAccess = new Router();
var skipSigninPageIfReturningUser = new Router();

publiclyAvailable.use(function(req, res, next) {
    next();
});

requireAccess.use(function(req, res, next) {
    if(req.session && req.session.currentUser) {
        next();
    } else {
        res.redirect('/signin2');
    }
});

skipSigninPageIfReturningUser.use(function(req, res, next) {
    if(req.session && req.session.currentUser) {
        res.redirect('/app/newsfeed');
    } else {
        next();
    }
});

app.use('/', publiclyAvailable);
app.use('/signin2', skipSigninPageIfReturningUser);
app.use('/api', publiclyAvailable);
app.use('/app', requireAccess);

app.get('/content/*', function(request, response){
    staticFiles.serve("." + request.url, response)
})

app.get('app/content/*', function(request, response){
    staticFiles.serve("." + request.url, response)
})

var auth = (function () {
    'use strict';

    function authenticateExistingUser(myUser, callback) {
        loginToken.createToken(myUser.username, function(myToken) {
            callback(null, true, { token : myToken, isNewUser : false, user : myUser });
        })
    }

    function authenticateNewUser(emailAdress, callback) {
        user.createUser(emailAdress, function (newUser, err) {
            if (err) {
                callback(err);
            }  else {
                loginToken.createToken(emailAdress, function(myToken) {
                    callback(null, true, { token : myToken, isNewUser : true, user : newUser });
                })
            }
        })
    }

    function authenticate(email, token, callback) {
        email = email.toLowerCase();
        loginToken.LoginToken.findOne({ email: email, token: token }, function(err, myToken) {
            if(err) {
                callback(err);
            } else if (myToken) {
                user.User.findOne({ username: email }, function(err, myUser) {
                    if(err) {
                        callback(err);
                    } else  if (myUser) {
                        authenticateExistingUser(myUser, callback)
                    } else {
                        authenticateNewUser(email, callback)
                    }
                })
            } else {
                callback(null, false);
            }
        })
    }

    return {
        authenticate : authenticate
    };
}());

//********************************************
//************** Register handlers ***********
//********************************************
if(!thSettings.isProduction()) {
    var templates = require('./code/templates.js')(thSettings);
    require('./code/preSigninPage.js')(app, templates, thSettings).registerHandlers();
    require('./code/signinPage.js')(app, templates, thSettings, user, loginToken, email, auth, url).registerHandlers();
    require('./code/newsfeedPage.js')(app, templates, thSettings, newsfeed).registerHandlers();
    require('./code/friendsPage.js')(app, templates, thSettings).registerHandlers();
}
//********************************************
//********************************************
//********************************************

app.get('/treehouse.manifest', function(request, response){
    staticFiles.serve("." + request.url, response)
})

app.get('/robots.txt', function(request, response){
    if(thSettings.isTest()) {
        staticFiles.serve("./test-robots.txt", response)
    } else {
        staticFiles.serve("." + request.url, response)
    }
})

app.get('/sitemap.xml', function(request, response){
    staticFiles.serve("." + request.url, response)
})

app.get('/channel.html', function(request, response){
    staticFiles.serve("." + request.url, response)
})

app.get('/achievement', function(request, response) {
    var url_parts = url.parse(request.url, true)
    var currentAchievementId = url_parts.query.achievementId
    var userId  = url_parts.query.userId
    var loggedin = false
    if (request.session) {
        if (request.session.currentUser) {
            if (request.session.currentUser._id == userId) {
                loggedin=true
            }
        }
    }
    progress.Progress.findOne({ achievement_id: currentAchievementId, achiever_id: userId }, function(err,currentProgress) {
        achievement.Achievement.findOne({ _id: currentAchievementId }, function(err2,currentAchievement) {
            if (currentProgress && (currentProgress.publiclyVisible || loggedin||currentAchievement.issuedAchievement))    {
                request.session.current_achievement_id = currentAchievementId
                var imageUrl = "" + currentAchievement.imageURL
                if (!imageUrl.startsWith('https')) {
                    imageUrl = 'http://www.treehouse.io/' + imageUrl
                }
                requestHandlers.publicAchievementPage(response, userId, currentAchievementId, request.url, imageUrl, currentAchievement.title, currentProgress.publiclyVisible)
            } else {
                requestHandlers.writeDefaultPage(request, response)
            }
        })
    })
})

app.get('/rememberMe', function(request, response){
    authenticateFromLoginToken(request, response)
})

app.get('/checkFBUser', function(request, response){
    user.User.findOne({ username: request.query.username.toLowerCase() }, function(err,myUser) {
        if (myUser) {
            getDataForUser(myUser, request, response)
        } else {
            createUser(request.query.username.toLowerCase(), request, response)
        }
    })
})

app.get('/fbAppConnect', function(request, response){
    var url_parts = url.parse(request.url, true)
    var code = url_parts.query.code
    var accessTokenLink= 'https://graph.facebook.com/oauth/access_token?client_id=480961688595420&client_secret=c0a52e2b21f053355b43ffb704e3c555&redirect_uri=http://www.treehouse.io/fbAppConnect&code=' + code
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
                        getDataForUser(myUser, request, response)
                    })
                }
            })
        }
    })
})

app.get('/signin', function(request, response) {
    signin(request, response)
})

app.get('/signup', function(request, response) {
    signin(request, response)
})

function signin(request, response) {
    var url_parts = url.parse(request.url, true)
    var email = url_parts.query.email.toLowerCase()
    var token = url_parts.query.token
    auth.authenticate(email, token, function (err, isAuthenticated, data) {
        if (err) {
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify("There was a problem creating your account. Contact staff@treehouse.io for more information."))
            response.end('\n', 'utf-8')
        } else if (isAuthenticated) {
            request.session.currentUser = data.user;
            response.cookie('rememberme', loginToken.cookieValue(data.token), { expires: new Date(Date.now() + 12 * 604800000), path: '/' }) //604800000 equals one week
            requestHandlers.writeDefaultPage(request, response);
        } else {
            response.redirect(302, thSettings.getDomain());
        }
    });
}

app.get('/checkUser', function(request, response){
    var username = request.query.username.toLowerCase();

    user.User.findOne({ username: username }, function(err, myUser) {
        var normalizedUsername = username;
        if(myUser) {
            normalizedUsername = myUser.username;
        }

        function createSignupLink(token) {
            return domain + "signin?email=" + normalizedUsername + "&token=" + token
        }

        var onTokenCreated;
        if(thSettings.isAutoSigninEnabled ()) {
            //Local testing - skip email and redirect to signup link directly
            onTokenCreated = function (myToken) {
                 if (myUser) {
                    response.writeHead(200, {'content-type': 'application/json' })
                    response.write(JSON.stringify({ url : createSignupLink(myToken.token) }))
                 } else {
                    response.writeHead(201, {'content-type': 'application/json' })
                     response.write(JSON.stringify({ url : createSignupLink(myToken.token) }))
                 }
                 response.end('\n', 'utf-8')
            };
        } else if (myUser) {
            onTokenCreated = function (myToken) {
                email.emailUser(
                    username,
                    'Sign in to Treehouse',
                    "<html>Click <a href='" + createSignupLink(myToken.token) + "'>here</a> to sign in to Treehouse.</html>",
                    'Go to ' + createSignupLink(myToken.token) +  ' to sign in to Treehouse!',
                     function() {
                         response.writeHead(200, {'content-type': 'application/json' })
                         response.write(JSON.stringify( myToken.token))
                         response.end('\n', 'utf-8')
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
                        response.writeHead(201, {'content-type': 'application/json' })
                        response.write(JSON.stringify( myToken.token ))
                        response.end('\n', 'utf-8')
                    }
                )
            };
        }

        loginToken.createToken(normalizedUsername, onTokenCreated);
    })
})

function getDataForUser(myUser, request, response) {
    request.session.currentUser = myUser
    loginToken.createToken(myUser.username, function(myToken) {
        response.cookie('rememberme', loginToken.cookieValue(myToken), { expires: new Date(Date.now() + 12 * 604800000), path: '/' }) //604800000 equals one week
        requestHandlers.writeDefaultPage(request, response)
    })
}

function createUser(emailAdress, request, response) {
    user.createUser(emailAdress, function (newUser,err) {
        if (err) {
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify("There was a problem creating your account. Contact staff@treehouse.io for more information."))
            response.end('\n', 'utf-8')
        }  else {
            loginToken.createToken(emailAdress, function(myToken) {
                response.cookie('rememberme', loginToken.cookieValue(myToken), { expires: new Date(Date.now() + 12 * 604800000), path: '/' }) //604800000 equals one week
                request.session.currentUser = newUser
                requestHandlers.writeDefaultPage(request, response)
            })
        }
    })
}

app.get('/signout', function(request, response){
    response.clearCookie('rememberme', null)
    if (request.session) {
        if (request.session.currentUser) {
            loginToken.remove(request.session.currentUser.username, function(){} )
        }
        request.session.destroy()
    }
    requestHandlers.indexPage(response, null, 0)
})


app.get('/user', function(request, response){
    var userID
    if (request.query.user_id && request.query.user_id.length > 2 && request.query.user_id != 'null') {
        userID = request.query.user_id
    } else if (request.query.user_id != 'null') {
        userID = request.session.currentUser._id
    }
    user.User.findOne({ _id: userID }, function(err,foundUser) {
        if (foundUser)    {
            response.send(foundUser, { 'Content-Type': 'application/json' }, 200)
        }   else {
            response.writeHead(404, {'content-type': 'application/json' })
            response.end('\n', 'utf-8')
        }
    })
})

app.get('/userIdForUsername', function(request, response){
    var username = request.query.username
    user.User.findOne({ username: username }, function(err,foundUser) {
        if (foundUser)    {
            response.send(foundUser._id, { 'Content-Type': 'application/json' }, 200)
        } else {
            response.writeHead(404, {'content-type': 'application/json' })
            response.end('\n', 'utf-8')
        }
    })
})

app.get('/currentUser', function(request, response){
    if (request.session.currentUser) {
        var userID = request.session.currentUser._id
        user.User.findOne({ _id: userID }, function(err,foundUser) {
            if (foundUser)    {
                response.send(foundUser, { 'Content-Type': 'application/json' }, 200)
            }
        })
    }
})

app.get('/prettyName', function(request, response){
    var userID
    if (request.query.user_id && request.query.user_id.length > 12) {
        userID = request.query.user_id
    } else {
        userID = request.session.currentUser._id
    }

    user.getPrettyNameAndImageURL(userID, function(prettyName) {
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify(prettyName))
        response.end('\n', 'utf-8')

    })
})

app.get('/setUserImage', function(request, response){
    user.setImageURL(request.session.currentUser._id , request.query.imageURL, function(error) {
        if (error) {
            response.writeHead(404, {'content-type': 'application/json' })
        } else {
            response.writeHead(200, {'content-type': 'application/json' })
        }
        response.end('\n', 'utf-8')
    })
})

app.get('/setPrettyName', function(request, response){
    var userID
    if (request.query.user_id && request.query.user_id.length > 12) {
        userID = request.query.user_id
    } else if (request.session.currentUser){
        userID = request.session.currentUser._id
    }
    if (userID) {
        user.setPrettyName(userID , request.query.firstName, request.query.lastName, function(error) {
            if (error) {
                response.writeHead(404, {'content-type': 'application/json' })
            } else {
                response.writeHead(200, {'content-type': 'application/json' })
            }
            response.end('\n', 'utf-8')
        })
    } else {
        response.writeHead(500, {'content-type': 'application/json' })
        response.end('\n', 'utf-8')
    }

})

app.get('/upgradeToIssuer', function(request, response){
    user.User.findOne({ _id: request.session.currentUser._id}, function(err, issuerProspect) {
        var text = "User " + issuerProspect.username + ", id: " +  issuerProspect._id + " wants to be an issuer. Make it so. 1. Confirm that the user is really the Issuer and willing to pay the corresponding fees. 2. Change user to issuer=true 3. Give the user an issuerName."
        email.emailUser('staff@treehouse.io', 'Issuer Request', text, text,  function(error) {
            if (error) {
                response.writeHead(404, {'content-type': 'application/json' })
            } else {
                response.writeHead(200, {'content-type': 'application/json' })
            }
            response.end('\n', 'utf-8')
        })
    })
})

app.get('/findFriends', function(request, response){
    user.User.findOne({ username: request.query.friend_email.toLowerCase() }, function(err,foundFriend) {
        if (foundFriend)    {
            if (request.session.currentUser._id == foundFriend._id ) {
                response.writeHead(400, {'content-type': 'application/json' })
                response.write(JSON.stringify('Dissociative identity disorder?'))
                response.end('\n', 'utf-8')
            }  else {
                friendship.isFriendRequestExisting(foundFriend._id, request.session.currentUser._id, function (requestExists, confirmed, createdByCurrentUser) {
                    var responseobject = {}
                    responseobject.id = foundFriend._id
                    responseobject.confirmed = confirmed
                    responseobject.createdByCurrentUser = createdByCurrentUser
                    responseobject.requestExists = requestExists
                    response.send(responseobject, { 'Content-Type': 'application/json' }, 200)
                })
            }
        } else {
            response.writeHead(400, {'content-type': 'application/json' })
            response.write(JSON.stringify(request.query.friend_email + ' does not appear to use Treehouse! Tell your friend about it and share the happiness!'))
            response.end('\n', 'utf-8')
        }
    })
})

app.get('/friendsList', function(request, response){
    friendship.getPendingRequests(request.session.currentUser._id, function(pendings) {
        friendship.getFriends(request.session.currentUser._id, function(friendsList) {
            fillFriendsList(friendsList, pendings, request.session.currentUser._id, function(content) {
                response.writeHead(200, {'content-type': 'application/json' })
                response.write(JSON.stringify(content))
                response.end('\n', 'utf-8')
            })
        })
    })
})

function fillFriendsList(friendsList, pendings, userId, callback) {
    var currentFriendId
    var friendsGoneThrough = 0
    var content = '<div id="friendsList"><div class="header">My friends</div>'
    content +=   '<div id="myfriends" class="myfriends">'
    if (friendsList.length > 0) {
        friendsList.forEach(function(currentFriendship) {
            if (currentFriendship.friend1_id.equals(userId)) {
                currentFriendId = currentFriendship.friend2_id
            } else {
                currentFriendId = currentFriendship.friend1_id
            }
            requestHandlers.getPrettyNameIdAndImageURL(currentFriendId, function(username, id, imageURL) {
                content +=   '<div class="itemwrap" id="friendshipid' + currentFriendship._id + '">'
                content +=   '<div class="leftcontainer"><a href="javascript:void(0)" onclick="visitFriend(\'' + id + '\', \'' + username + '\')"><img width="56" height="56" src="'+ imageURL + '" /></a></div>'
                content +=   '<div class="rightcontainer">'
                content += '<h3>'
                content +=  '<a class="headerlink" href="javascript:void(0)" onclick="visitFriend(\'' + id + '\', \'' + username + '\')">' +username + '</a>'
                content += '</h3>'
                content +=   ' <span class="remove"><a href="javascript:void(0)" onclick="removeFriendship(\'' + currentFriendship._id  + '\')">Remove</a></span>'
                content +=   '</div>'
                content +=   '<div class="clear"></div>'
                friendsGoneThrough++
                if  (friendsGoneThrough < friendsList.length || pendings.length > 0)   {
                    content +=   '<div class="separerare-part">&nbsp;</div>'
                }
                content +=   '</div>'

                if (friendsGoneThrough === friendsList.length) {
                    if (pendings.length > 0) {
                        addPendings(content, pendings, userId, callback)
                    }  else {
                        content +=   '</div>'
                        callback(content)
                    }
                }
            })
        })
    } else {
        if (pendings.length > 0) {
            addPendings(content, pendings, userId, callback)
        }  else {
            content += '</div></div>'
            callback(content)
        }
    }

}

function addPendings(content, pendings, userId, callback) {
    var currentFriendId
    var pendingsGoneThrough = 0
    pendings.forEach(function(currentFriendship) {
        if (currentFriendship.friend1_id.equals(userId)) {
            currentFriendId = currentFriendship.friend2_id
        } else {
            currentFriendId = currentFriendship.friend1_id
        }
        requestHandlers.getPrettyNameIdAndImageURL(currentFriendId, function(username, id, imageURL) {
            content +=   '<div class="itemwrap friendrequest" id="friendshipid' + currentFriendship._id + '">'
            content +=   '<div class="leftcontainer"><a href="javascript:void(0)" onclick="visitFriend(\'' + id + '\', \'' + username + '\')"><img width="56" height="56" src="' + imageURL + '" /></a></div>'
            content +=   '<div class="rightcontainer">'
            content += '<h3>'
            content +=  '<a class="headerlink" href="javascript:void(0)" onclick="visitFriend(\'' + id + '\', \'' + username + '\')">'+username + '</a><p>wants to be your friend.</p>'
            content += '</h3>'
            content +=   ' <span class="confirm"><a style="color: #000" href="javascript:void(0)" onclick="confirmFriendRequest(\'' + currentFriendship._id + '\')">Confirm</a></span>'
            content +=   ' <span class="ignore"><a style="color: #000" href="javascript:void(0)" onclick="ignoreFriendRequest(\'' + currentFriendship._id + '\')">Ignore</a></span>'
            content +=   '</div>'
            content +=   '<div class="clear"></div>'
            pendingsGoneThrough++
            if  (pendingsGoneThrough < pendings.length)   {
                content +=   '<div class="separerare-part">&nbsp;</div>'
            }
            content +=   '</div>'
            if (pendingsGoneThrough === pendings.length) {
                content += '</div></div>'
                callback(content)
            }
        })
    })
}

app.get('/shareList', function(request, response){
    var friendIds = []
    var userId
    if (request.session.currentUser) {
        userId = request.session.currentUser._id
    }

    friendship.getFriends(userId, function(friendsList) {
        if (friendsList.length > 0) {
            var friendsGoneThrough = 0
            friendsList.forEach(function(currentFriendship) {
                if (currentFriendship.friend1_id.equals(userId)) {
                    friendIds.push(currentFriendship.friend2_id)
                } else {
                    friendIds.push(currentFriendship.friend1_id)
                }
                friendsGoneThrough++
                if (friendsGoneThrough === friendsList.length) {
                    fillShareList(friendIds, userId, request.query.achievementId, function(content) {
                        response.writeHead(200, {'content-type': 'application/json' })
                        response.write(JSON.stringify(content))
                        response.end('\n', 'utf-8')
                    })
                }
            })
        }  else {
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify('<div id="sharerList"><p class="noshareandcompare">Add some friends to have someone to share with</p></div>'))
            response.end('\n', 'utf-8')
        }
    })
})

function fillShareList(friendsList, userId, achievementId, callback) {
    var content = '<div id="sharerList">'
    achievement.Achievement.findById( achievementId , function(err, foundAchievement) {
        if(foundAchievement.createdBy != userId) {
            content += '<p class="noshareandcompare">You can only share achievements you created yourself</p>'
            content += '</div>'
            callback(content)
        } else {
            var goneThrough= 0
            friendsList.forEach(function(currentFriendship, index) {
                shareholding.Shareholding.findOne({ sharer_id: userId, shareholder_id: friendsList[index], achievement_id: achievementId }, function(err, alreadySharedToFriend) {
                    requestHandlers.getPrettyNameIdAndImageURL(friendsList[index], function(username, id, imageURL) {
                        content +=   '<div class="sharerlistitem">'
                        content +=   '<div class="leftcontainer"><img width="56" height="56" src="' + imageURL +'" /></div>'
                        content +=   '<div class="rightcontainer">'
                        content +=   '<h3>'
                        content +=    username
                        content +=   '</h3>'
                        if (alreadySharedToFriend == null) {
                            content += ' <span id="shareholderid' + friendsList[index] + '"><a class="sharelink" href="javascript:void(0)" onclick="shareToFriend(\'' + friendsList[index] + '\',\'' + achievementId +  '\')">Share</a></span>'
                        } else {
                            if (alreadySharedToFriend.confirmed) {
                                content += '<p class="alreadyshared">Already got this!</p>'
                            } else {
                                content += '<p class="alreadyshared">Share request pending!</p>'
                            }
                        }
                        content +=   '</div>'
                        content +=   '<div class="clear"></div>'
                        goneThrough++
                        if (!(goneThrough === friendsList.length)) {
                            content +=   '<div class="separerare-part">&nbsp;</div>'
                        }
                        content +=   '</div>'
                        if (goneThrough === friendsList.length) {
                            content += '</div>'
                            callback(content)
                        }
                    })
                })
            })
        }
    })
}

app.get('/compareList', function(request, response){
    var friendIds = []
    var content = ""
    var userId
    var comparesGoneThrough = 0

    if (request.session.currentUser) {
        userId = request.session.currentUser._id
    }
    shareholding.getCompares(request.query.achievementId, userId, function(compareList) {
        if (compareList && compareList.length > 0) {
            compareList.forEach(function(currentCompare) {
                var myQuantityFinished = 0
                var myQuantityTotal = 0
                var goalsGoneThrough = 0
                requestHandlers.getPrettyNameIdAndImageURL( currentCompare.achiever_id, function(prettyName, id, imageURL) {
                    achievement.Achievement.findOne({ _id: request.query.achievementId }, function(err,currentAchievement) {
                        currentAchievement.goals.forEach(function(goal) {
                            progress.Progress.findOne({ goal_id: goal._id, achiever_id: currentCompare.achiever_id }, function(err,myProgress) {
                                if (err) {
                                    console.log("error in app.js 3: couldn't find progress for user " + currentCompare.achiever_id)
                                } else {
                                    goalsGoneThrough++
                                    myQuantityFinished += myProgress.quantityFinished
                                    myQuantityTotal += goal.quantityTotal
                                    if (goalsGoneThrough === currentAchievement.goals.length) {
                                        comparesGoneThrough++
                                        content += getCompareText(prettyName, myQuantityFinished, myQuantityTotal, comparesGoneThrough, compareList.length, currentCompare.achiever_id, request.query.achievementId, myProgress.publiclyVisible, currentAchievement.title, imageURL)
                                        if (comparesGoneThrough === compareList.length) {
                                            response.writeHead(200, {'content-type': 'application/json' })
                                            response.write(JSON.stringify(content))
                                            response.end('\n', 'utf-8')
                                        }
                                    }
                                }
                            })
                        })
                    })
                })
            })
        }  else {
            content = '<p class="noshareandcompare">Before you can compare this achievement you need to succesfully share it to a friend.</p>'
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify(content))
            response.end('\n', 'utf-8')
        }
    })
})

function getCompareText(prettyName, finished, total, index, nrOfCompares, achieverId, achievementId, publiclyVisible, title, imageURL) {
    var  titleWithSingleQuotationsEscaped = title.replace(/'/g, '&apos;')
    var compareText = '<div class="part-achievement">'
    + '<div class="progress-container">'
    + '<h3><a class="headerlink" href="javascript:void(0)" onclick="openAchievement(\'' + achievementId + '\', \'' + achieverId + '\', ' + publiclyVisible + ', \'' +  encodeURIComponent(titleWithSingleQuotationsEscaped) + '\')">'
        + prettyName
    + '</a></h3>'
    + '<table border="0px">'
        + '<tr>'
            + '<td class="bararea">'
                + '<div class="progress-goal-container">'
                    + '<span class="progressbar"></span>'
                    + '<div id="progressbar-goal"><span'
        if (index===0) {
            compareText += ' id="progressCompare"'
        }
        compareText += ' class="progress" style="width:'
                                                + (finished/total) * 100
                                             + '%;"></span></div></div>'
            + '</td>'
            + '<td'
        if (index==0) {
            compareText +=' id="countareaCompare"'
        }
        compareText += ' class="countarea">'
                + '<h3>'
        + Math.floor((finished/total) * 100)
                + '%</h3>'
            + '</td><td>&nbsp;</td><td>'
        var completed = finished >= total
        var isAchievementCreatedByMe = false
        compareText    += '<div class="user-image"><a href="javascript:void(0)" onclick="openAchievement(\'' + achievementId + '\', \'' + achieverId + '\', ' + publiclyVisible + ', \'' + encodeURIComponent(titleWithSingleQuotationsEscaped) + '\')"><img width="56" height="56" src="' +imageURL + '" alt="Visit friend!"/></a></div>'
        compareText += '</td></tr></table>'
        compareText    += '<div class="clear"></div>'
        compareText    += '</div>'
    if (index < nrOfCompares) {
        compareText += '<div class="separerare-part">&nbsp;</div>'
    }
    compareText += '</div>'
    return compareText
}

app.get('/shareToFriend', function(request, response){
    shareholding.createShareholding(request.session.currentUser._id, request.query.friendId, request.query.achievementId, function(ok) {
        if (ok) {
            user.User.findOne({ _id: request.query.friendId }, function(err, askedFriend) {
                user.User.findOne({ _id: request.session.currentUser._id}, function(err, askingFriend) {
                    email.emailUser(
                        askedFriend.username,
                        askingFriend.username + ' just shared an Achievement with you!',
                        "<html>" + askingFriend.username  + " just shared an Achievement with you on Treehouse! Login and confirm?</html>",
                        askingFriend.username + ' just shared an Achievement with you on Treehouse! Login and confirm?',
                        function() {}   //do nothing
                    )
                })
            })
            response.writeHead(200, {'content-type': 'application/json' })
            response.end('\n', 'utf-8')
        } else {
            response.writeHead(404, {'content-type': 'application/json' })
            response.end('\n', 'utf-8')
        }

    })
})


app.get('/addFriend', function(request, response){
    friendship.createFriendship(request.session.currentUser._id, request.query.friendId, function(ok) {
        if (ok) {
            user.User.findOne({ _id: request.query.friendId }, function(err, askedFriend) {
                user.User.findOne({ _id: request.session.currentUser._id}, function(err, askingFriend) {
                    email.emailUser(
                        askedFriend.username,
                        askingFriend.username + ' wants to be your friend on Treehouse',
                        "<html>" + askingFriend.username  + " wants to be your friend on Treehouse! Login and confirm?</html>",
                        askingFriend.username + ' wants to be your friend on Treehouse! Login and confirm?',
                        function() {}   //no nothing
                    )
                })
            })
            response.writeHead(200, {'content-type': 'application/json' })
            response.end('\n', 'utf-8')
        } else {
            response.writeHead(404, {'content-type': 'application/json' })
            response.end('\n', 'utf-8')
        }

    })
})

app.get('/ignoreFriendRequest', function(request, response){
    friendship.removeFriendRequest(request.query.friendship_id, function() {
        request.session.nrOfFriendShipRequests--
        response.writeHead(200, {'content-type': 'application/json' })
        response.end('\n', 'utf-8')
    })
})

app.get('/confirmFriendRequest', function(request, response){
    friendship.confirmFriendRequest(request.query.friendship_id, function(friendId) {
        user.User.findOne({ _id: friendId}, function(err, foundUser) {
            user.getPrettyNameAndImageURL(friendId, function(prettyName, imageURL) {
                var responseobject = new Object()
                responseobject.username = prettyName
                responseobject.id = friendId
                response.send(responseobject, { 'Content-Type': 'application/json' }, 200)
            })
        })
    })
})

app.get('/ignoreAchievement', function(request, response){
    shareholding.ignoreShareHolding(request.query.achievementId, request.query.userId, function() {
        response.writeHead(200, {'content-type': 'application/json' })
        response.end('\n', 'utf-8')
    })
})

app.get('/confirmAchievement', function(request, response){
    shareholding.confirmShareHolding(request.query.achievementId, request.query.userId, function(title) {
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify(title))
        response.end('\n', 'utf-8')
    })
})

app.get('/acceptIssuedAchievement', function(request, response){
    achievement.acceptIssuedAchievement(request.query.achievementId, request.query.userId, function(title) {
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify(title))
        response.end('\n', 'utf-8')
    })
})

app.get('/newsfeed', function(request, response){
    var userId
    if (request.session.currentUser) {
        userId = request.session.currentUser._id
    }
    newsfeed.getNewsfeed(userId, function(newsfeedFromServer) {
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify(newsfeedFromServer))
        response.end('\n', 'utf-8')
    })
})

app.get('/latestAchievementSplash', function(request, response) {
    var latestAchievementId = latestAchievement.getId(function(latestProgressId) {
        progress.Progress.findOne({ _id: latestProgressId }, function(err,latestProgress) {
           if (latestProgress) {
               achievement.Achievement.findOne({ _id: latestProgress.achievement_id }, function(err,latestAchievement) {
                   response.writeHead(200, {'content-type': 'application/json' })
                   if (latestAchievement) {
                       var titleWithQuotationsEscaped = encodeURIComponent(latestAchievement.title.replace(/'/g, '&apos;'))
                       var content = '<h2>Latest Achievement</h2>' +
                           '<p><a class="latestAchievementLink" href="javascript:void(0)" onclick="showLatestAchievement(\'' + latestAchievement._id + '\', \'' + latestProgress.achiever_id + '\', \'' + titleWithQuotationsEscaped + '\')">' + latestAchievement.title + '</a></p>' +
                           '<div><a class="latestAchievementLink" href="javascript:void(0)" onclick="showLatestAchievement(\'' + latestAchievement._id + '\', \'' + latestProgress.achiever_id + '\', \'' + titleWithQuotationsEscaped + '\')"><img src="' + latestAchievement.imageURL + '" /></a></div>'
                   }
                   response.write(JSON.stringify(content))
                   response.end('\n', 'utf-8')
               })
           } else {
               var today = new Date().toUTCString()
               response.writeHead(200, {
                   "Content-Type": "application/json",
                   "Last-Modified": today,
                   "Expires": today
               })
               var content = '<h2>Latest Achievement</h2>'   +
                   '<p></p>' +
                   '<div></div>'
               response.write(JSON.stringify(content))
               response.end('\n', 'utf-8')
           }
        })
    })
})

function createIssuedAchievementsDesc(achievements, achieverId) {
    var titleWithSingleQuotationsEscaped
    var title
    var achievementsList = ""
    for (var i in achievements) {
        title = achievements[i].issuerName + ": " + achievements[i].title
        titleWithSingleQuotationsEscaped = title.replace(/'/g, '&apos;')
        achievementsList += "<div class='achievement'>"
        achievementsList += '<div class="achievementIcons"><ul>'
        achievementsList += '<li><img src="content/img/public.png" /></li>'
        achievementsList += '</ul></div><div class="container"><a href="javascript:void(0)" onclick="openIssuedAchievement(\''
            + achievements[i]._id
            + '\', \''
            +  encodeURIComponent(titleWithSingleQuotationsEscaped)
            + '\''
        achievementsList += ')"><img width="96" height="96" src="'
            + achievements[i].imageURL
            + '" alt="'
            + achievements[i].title
            + '"/><span class="gradient-bg"> </span><span class="progressbar"> </span> '
        achievementsList += '  <div class="progress-container-achievements"><span class="progress" style="width:0%"> </span></div></a></div><p>'
        achievementsList += achievements[i].issuerName + ": "
        achievementsList +=  achievements[i].title
            + '</p>'
        achievementsList += '<div class="separerare-part">&nbsp;</div></div>'
    }
    return achievementsList
}

function createAchievementDesc(achievements,progresses, achieverId, percentages, completed, lookingAtFriendsAchievements, sharedAchievements, isAchievementCreatedByMe) {
    var titleWithSingleQuotationsEscaped
    var achievementsList = ""
    for (var i in achievements) {
        titleWithSingleQuotationsEscaped = achievements[i].title.replace(/'/g, '&apos;')
        if ((completed || lookingAtFriendsAchievements) && i == 0) {
            achievementsList += "<div class='achievement'>"
        } else {
            achievementsList += "<div class='achievement'>"
        }
        achievementsList += '<div class="achievementIcons"><ul>'
        if (progresses[i].publiclyVisible) {
            achievementsList += '<li><img src="content/img/public.png" /></li>'
        }

        if (sharedAchievements[i]) {
            achievementsList +=  '<li><img src="content/img/shared.png"  /></li>'
        }
        achievementsList += '</ul></div><div class="container"><a href="javascript:void(0)" onclick="openAchievement(\''
                + achievements[i]._id
                + '\', \''
                + achieverId
                + '\', '
                + progresses[i].publiclyVisible
                + ', \''
                +  encodeURIComponent(titleWithSingleQuotationsEscaped)
            + '\''
        achievementsList += ')"><img width="96" height="96" src="'
            + achievements[i].imageURL
            + '" alt="'
            + achievements[i].title
            + '"/><span class="gradient-bg"> </span><span class="progressbar"> </span> '
        if (completed) {
            achievementsList += '<span class="unlockedDate"><div>Unlocked <br/>' +  moment(progresses[i].latestUpdated).format("MMM Do YYYY")  + '</div></span>'
        }
        achievementsList += '  <div class="progress-container-achievements"><span class="progress" style="width:'
            + percentages[i]
            + '%"> </span></div></a></div><p>'
        if (achievements[i].issuedAchievement) {
                achievementsList += achievements[i].issuerName + ": "
        }
        achievementsList +=  achievements[i].title
            + '</p>'

        achievementsList += '<div class="separerare-part">&nbsp;</div></div>'
    }
    return achievementsList
}

function createNotificationDesc(response, achievementsList, completedAchievements, nrOfAchievements, notifications, achieverId, lookingAtFriend) {
    var shortNames = []

    for (var i in notifications) {
        user.getShortName(notifications[i].createdBy, function(prettyName) {
            shortNames.push(prettyName)
            if (shortNames.length == notifications.length) {
                var notificationsList = ""
                for (var j in notifications) {
                    var  titleWithSingleQuotationsEscaped = notifications[j].title.replace(/'/g, '&apos;')
                    notificationsList += "<div class='achievement'>"
                    notificationsList += '<div class="container"><a href="javascript:void(0)" onclick="openShareNotification(\''
                        + notifications[j]._id
                        + '\', \''
                        + achieverId
                        + '\', \''
                        + notifications[j].createdBy
                        + '\')"><img src="'
                        + notifications[j].imageURL
                        + '" alt="'
                        + titleWithSingleQuotationsEscaped
                        + '"/><span class="gradient-bg"> </span><span class="request"><div>Challenged <br/>'
                    if (shortNames[j]) {
                        notificationsList += 'by '+ shortNames[j] + ''
                    }
                    notificationsList += ' </div></span></a></div><p>'  + titleWithSingleQuotationsEscaped
                        + '</p><div class="separerare-part">&nbsp;</div></div>'
                    if (j >= notifications.length - 1) {
                        achievementsList +=  notificationsList
                        finishAchievementsList(response, achievementsList, completedAchievements, lookingAtFriend)
                    }
                }
            }
        })
    }
}

app.get('/achievements_inProgress', function(request, response){
    getAchievementList(request, response, false)
})

app.get('/achievements_completed', function(request, response){
    getAchievementList(request, response, true)
})

app.get('/achievements_issued', function(request, response){
    getIssuedAchievements(request, response)
})

function getIssuedAchievements(request, response) {
    var issuedList = "<div class='achievement'><p>"
    var issuedAchievementsToShow = new Array()
    var goneThroughIssuedAchievements = 0
    achievement.Achievement.find({ isIssued: true}, {}, { sort: { 'createdDate' : -1 } }, function(err, issuedAchievements) {
        if (err) {
            console.log("error in app.js: couldn't find any issued achievements")
        }
        if (issuedAchievements && issuedAchievements.length > 0) {
            issuedAchievements.forEach(function(currentAchievement) {
                achievement.userHasAcceptedAchievement(currentAchievement._id, request.session.currentUser._id, function(acceptedAlready) {
                    goneThroughIssuedAchievements++
                    if (!acceptedAlready) {
                        issuedAchievementsToShow.push(currentAchievement)
                    }
                    if (goneThroughIssuedAchievements === issuedAchievements.length) {
                        if(issuedAchievementsToShow.length > 0) {
                            issuedList += createIssuedAchievementsDesc(issuedAchievementsToShow, request.session.userId)
                            response.writeHead(200, {'content-type': 'application/json' })
                            response.write(JSON.stringify(issuedList + "</p></div>"))
                            response.end('\n', 'utf-8')
                        } else {
                            response.writeHead(200, {'content-type': 'application/json' })
                            response.write(JSON.stringify(issuedList + "No new challenges found!</p></div>"))
                            response.end('\n', 'utf-8')
                        }

                    }
                })
            })
        } else {
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify(issuedList + "No challenges found.</p></div>"))
            response.end('\n', 'utf-8')
        }
    })

}

function getAchievementList(request, response, completedAchievements) {
    request.session.current_achievement_id = null

    var achievementsList = ""
    var goneThroughProgresses = 0
    var achievementsToShow = new Array()
    var progressesToShow = new Array()
    var achievementIdsGoneThrough = new Array()
    var percentages = new Array()
    var areAchievementsShared = new Array()
    var lookingAtFriendsAchievements = (request.query.lookingAtFriend === 'true')
    var achieverId
    if (lookingAtFriendsAchievements) {
        achieverId = request.query.achieverId
    } else {
        achieverId = request.session.currentUser._id
    }

    var userId
    if (request.session.currentUser) {
        userId = request.session.currentUser._id
    }
    progress.Progress.find({ achiever_id: achieverId}, {}, { sort: { 'latestUpdated' : -1 } }, function(err, progresses) {
        if (err) { console.log("error in app.js 1: couldn't find any progress for user " + achieverId) }
        if (progresses && progresses.length > 0) {
            if (!lookingAtFriendsAchievements && !completedAchievements ) {achievementsList += '<div class="achievement"><div class="container"><a href="javascript:void(0)" onclick="insertContent(getNewAchievementContent(null, \'' + achieverId + '\'), setDefaultMenu(\'Create Achievement\', false))"><img src="content/img/empty.png" alt=""/></a></div><p>Create new achievement</p><div class="separerare-part">&nbsp;</div></div>' }
            progresses.forEach(function(currentProgress) {
                achievement.Achievement.findById(currentProgress.achievement_id, function(err2, myAchievement) {
                    if (err2) { console.log("error in app.js 2: couldn't find achievement for progress " + currentProgress.achievement_id) }
                    if (myAchievement) {
                        if  (_.indexOf(achievementIdsGoneThrough, myAchievement._id.toString()) == -1) {
                            achievementIdsGoneThrough.push(myAchievement._id.toString())
                             calculateAchievementProgressFromData(myAchievement.goals, progresses, function(achievementPercentageFinished) {
                                shareholding.isAchievementShared(myAchievement._id, function(isAchievementShared) {
                                    shareholding.isAchievementCreatedByMe(achieverId, myAchievement._id, function(isAchievementCreatedByMe) {
                                        shareholding.isAchievementSharedByMe(userId, myAchievement._id, function(isAchievmentSharedByMe) {
                                            if(!lookingAtFriendsAchievements || currentProgress.publiclyVisible || isAchievmentSharedByMe) {
                                                if ((completedAchievements && achievementPercentageFinished == 100) || (!completedAchievements && achievementPercentageFinished < 100)) {
                                                        areAchievementsShared.push(isAchievementShared)
                                                        achievementsToShow.push(myAchievement)
                                                        progressesToShow.push(currentProgress)
                                                        percentages.push(achievementPercentageFinished)
                                                }
                                            }

                                            goneThroughProgresses +=  myAchievement.goals.length
                                            if (goneThroughProgresses == progresses.length) {
                                                achievementsList += createAchievementDesc(achievementsToShow, progressesToShow, achieverId, percentages, completedAchievements, lookingAtFriendsAchievements,areAchievementsShared, isAchievementCreatedByMe)
                                                getSharedAchievementNotifications(achievementsToShow.length, response, achievementsList, completedAchievements, achieverId, userId, lookingAtFriendsAchievements)
                                            }
                                        })
                                    })
                                })
                            })
                        }
                    }
                })
            })
        } else {
            if (!lookingAtFriendsAchievements && !completedAchievements ) {
                achievementsList += '<div class="achievement"><div class="container"><a href="javascript:void(0)" onclick="insertContent(getNewAchievementContent(null, \'' + achieverId + '\'), setDefaultMenu(\'Create Achievement\', false))"><img src="content/img/empty.png" alt=""/></a></div><p>Create new achievement</p><div class="separerare-part">&nbsp;</div></div>'
            }
            getSharedAchievementNotifications(0, response, achievementsList, completedAchievements, achieverId, userId, lookingAtFriendsAchievements)
        }
    })
}

function getSharedAchievementNotifications(nrOfAchievements, response, achievementsList, completedAchievements, achieverId, userId, lookingAtFriendsAchievements) {
    if (completedAchievements) {
        finishAchievementsList(response, achievementsList, completedAchievements, lookingAtFriendsAchievements)
    } else {
        shareholding.getSharedAchievementNotifications(achieverId, userId, function(notifications) {
            if (!lookingAtFriendsAchievements && notifications) {
                createNotificationDesc(response, achievementsList, completedAchievements, nrOfAchievements, notifications, achieverId, achieverId != userId)
            }  else {
                finishAchievementsList(response, achievementsList, completedAchievements, lookingAtFriendsAchievements)
            }
        })
    }
}

function finishAchievementsList(response, achievementsList, completedAchievements, lookingAtFriendsAchievements) {
    if (achievementsList.length < 1) {
        if (lookingAtFriendsAchievements) {
            if (completedAchievements) {
                achievementsList = "<div class='achievement'><p>Your friend has nothing to brag about.</p></div>"
            } else {
                achievementsList = "<div class='achievement'><p>Your friend has not dared to show any challenges. Sad but true.</p></div>"
            }
         }  else {
            achievementsList = "<div class='achievement'><p>You do not have any unlocked achievements yet.</p></div>"
        }
    }
    response.writeHead(200, {'content-type': 'application/json' })
    response.write(JSON.stringify(achievementsList))
    response.end('\n', 'utf-8')
}

var achievementPage = require('./code/achievementPage.js')(user, progress, moment, shareholding, achievement, url, requestHandlers);
app.get('/achievementFromServer', function(request, response){
    achievementPage.showAchievementPage(request, response)
})

app.get('/issuedAchievementFromServer', function(request, response){
    showIssuedAchievementPage(request, response)
})

function showIssuedAchievementPage(request, response) {
    var url_parts = url.parse(request.url, true)
    var currentAchievementId = url_parts.query.achievementId.trim()
    achievement.Achievement.findOne({ _id: currentAchievementId }, function(err,currentAchievement) {
        var goalTexts = []
        var achievementDesc = ''
        requestHandlers.getPrettyNameIdAndImageURL(currentAchievement.createdBy, function(creatorName, creatorId, creatorImageURL) {
             currentAchievement.goals.forEach(function(goal) {
                if (err) {
                    console.log("error in app.js: couldn't find goals for achievement " + currentAchievement._id + ", " + err)
                } else {
                    goalTexts.push(getIssuedGoalText(goal, currentAchievement, goalTexts.length + 1 == currentAchievement.goals.length))
                    if (goalTexts.length == currentAchievement.goals.length) {
                        var goalTextsText = ""
                        var goalsGoneThrough = 0
                        goalTexts.forEach(function(goalText) {
                            goalTextsText += goalText
                            goalsGoneThrough++
                            if (goalsGoneThrough === goalTexts.length) {
                                achievementDesc += '<div class="achievement-info"><div id="userarea"><img src="' + creatorImageURL + '" /><p id="creator">' + currentAchievement.issuerName + '</p></div> '
                                achievementDesc += '<div class="actionmenu"><ul><li><a href="javascript:void(0)" onclick="acceptIssuedAchievement(\'' + currentAchievementId + '\', \'' + request.session.currentUser._id + '\')"><img src="content/img/challengeaccepted.png" alt="challenge accepted" /></a></li><li class=""></li></ul></div>'
                                achievementDesc += '<div class="separerare"> </div>'
                                    +'<div class="textarea"><h2>'
                                    + currentAchievement.title
                                    + '</h2>'
                                achievementDesc += '<p id="creator"> by ' + currentAchievement.issuerName  + '</p>'
                                achievementDesc += '<p id="achievementDescription">'
                                    + currentAchievement.description
                                    + '</p>'
                                    + '</div>'
                                    + '<div class="imagearea"><img '
                                achievementDesc += 'src="'
                                    + currentAchievement.imageURL
                                    +'" alt="'
                                    +  currentAchievement.createdBy + ": " + currentAchievement.title
                                    + '"/><span class="gradient-bg"></span><span class="progressbar"></span><div id="progressbar" class="progress-container"><span id="mainProgress" class="progress" style="width:0%;"></span></div>'
                                achievementDesc += '</div><div class="clear"></div>'
                                achievementDesc += '<div id="achievementTabs"><a style="color:black" href="javascript:void(0)" onclick="progressTab()"><span id="progressTab">Goals</span></a><div class="clear"></div></div>'
                                achievementDesc += '<div id="achievement-container">'
                                achievementDesc += goalTextsText
                                achievementDesc += '</div>'
                                //using public domain - localhost makes FB-like component not load since localhost is not registered as a Treehouse app domain
                                /*var achLink = "http://www.treehouse.io/achievement?achievementId=" + currentAchievement._id + "&userId=" + achiever._id
                                var encodedAchLink = encodeURIComponent(achLink)
                                achievementDesc += '<div id="sharer-container"></div><div id="compare-container"></div>'
                                achievementDesc += '<div id="appcontainerSocial" class="publicWrap"><div id="fbLike" style="overflow: visible">'
                                achievementDesc +='<iframe width="95" src="//www.facebook.com/plugins/like.php?href=' + encodedAchLink + '&amp;width&amp;layout=button_count&amp;locale=en_US&amp;action=like&amp;show_faces=true&amp;share=false&amp;height=80&amp;appId=480961688595420" scrolling="no" frameborder="0" style="border:none; overflow:hidden; height:80px;" allowTransparency="true"></iframe>'
                                achievementDesc += '</div><div id="fbShare"><a onclick="fbShare(\''+ encodeURIComponent(currentAchievement.title) + '\', \'' +  achLink +'\', \'' + currentAchievement.imageURL + '\')" href="javascript:void(0)"><span><img src="content/img/f-icon.png"><p>Share</p></span></a>'
                                achievementDesc += '</div>'
                                achievementDesc += '<div id="tweetAchievement" style="overflow:visible;">'
                                achievementDesc += '<a href="https://twitter.com/share?url=' + encodedAchLink + '&text=' + currentAchievement.title + '" class="twitter-share-button">Tweet</a>'
                                achievementDesc +='<script type="text/javascript">(function() {var s = document.createElement("SCRIPT");var c = document.getElementsByTagName("script")[0];s.type = "text/javascript";s.async = true;s.src = "http://platform.twitter.com/widgets.js";c.parentNode.insertBefore(s, c);})();</script>'
                                */
                                achievementDesc += '</div><div class="clear"> </div></div></div>'
                                response.write(JSON.stringify(achievementDesc))
                                response.end('\n', 'utf-8')
                            }
                        })
                    }
                }
            })
        })
    })
}

function getIssuedGoalText(goal, achievement, lastGoal) {
    var goalText =  '<div class="part-achievement">'
        + '<div class="progress-container">'
        + '<h3>'
        + goal.title
        + '</h3>'
        + '<table border="1px">'
        + '<tr>'
        + '<td class="bararea">'
        + '<div class="progress-goal-container">'
        + '<span class="progressbar"></span>'
        + '<div id="progressbar-goal' + goal._id + '"><span class="progress" id="progress' + goal._id + '" style="width:0%;"></span></div></div>'
        + '</td>'
        + '<td id="countarea' + goal._id + '" class="countarea">'
        + '<h3>0'
        + '/'
        + goal.quantityTotal
        + '</h3>'
        + '</td><td>'
    goalText    += '<div id="addbutton' + goal._id + '" class="addbutton">'
    goalText    += '</div></td></tr>'
        + '</table>'
    goalText    += '<div class="clear"></div>'
    goalText    += '</div>'
    if (!lastGoal) {
        goalText    += '<div class="separerare-part">&nbsp;</div>'
    }
    goalText    += '</div>'
    return goalText
}

app.get('/achievementPercentage', function(request, response){
    calculateAchievementProgress(request.session.currentUser._id, request.session.current_achievement_id, function(achievementPercentageFinished) {
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify(achievementPercentageFinished))
        response.end('\n', 'utf-8')
    })
})

function calculateAchievementProgress(userId, achievementId, callback) {
    achievement.Achievement.findOne({ _id: achievementId }, function(err,currentAchievement) {
       progress.Progress.find({ achievement_id: achievementId, achiever_id:  userId}, function(err,progresses) {
            calculateAchievementProgressFromData(currentAchievement.goals, progresses, callback)
       })
    })
}

function calculateAchievementProgressFromData(goals, progresses, callback) {
    var achievementCurrentProgress = 0
    var achievementTotalProgress = 0
    var goalsGoneThrough = 0
    var progressForGoal
    goals.forEach(function(goal) {
        achievementTotalProgress += goal.quantityTotal
        progressForGoal = _.find(progresses, function(progressObj){return String(progressObj.goal_id) === String(goal._id)})
         achievementCurrentProgress += progressForGoal.quantityFinished
        goalsGoneThrough++
        if (goalsGoneThrough === goals.length) {
            var achievementPercentageFinished = Math.floor((achievementCurrentProgress/ achievementTotalProgress) * 100)
            callback(achievementPercentageFinished)
        }
    })
}

app.get('/progress', function(request, response){
    progress.markProgress(request.session.currentUser._id, request.query.goalId, function(quantityFinished) {
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify(quantityFinished))
        response.end('\n', 'utf-8')
    })
})

app.get('/issue', function(request, response){
    achievement.Achievement.findOne({ _id: request.session.current_achievement_id }, function(err,currentAchievement) {
        if (currentAchievement) {
            achievement.issue(currentAchievement, function() {
                response.writeHead(200, {'content-type': 'application/json' })
                response.write(JSON.stringify("ok"))
                response.end('\n', 'utf-8')
            })
        }
    })
})

app.get('/publicize', function(request, response){
    progress.Progress.findOne({ achievement_id: request.session.current_achievement_id, achiever_id: request.session.currentUser._id }, function(err,currentAchievementProgress) {
        achievement.publicize(currentAchievementProgress)
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify("ok"))
        response.end('\n', 'utf-8')
    })
})

app.get('/unpublicize', function(request, response){
    progress.Progress.findOne({ achievement_id: request.session.current_achievement_id, achiever_id: request.session.currentUser._id }, function(err,currentProgress) {
        achievement.unpublicize(currentProgress)
        shareholding.isAchievementShared(request.session.current_achievement_id, function(isShared) {
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify(isShared))
            response.end('\n', 'utf-8')
        })
    })
})

app.get('/deleteUser', function(request, response) {
    var url_parts = url.parse(request.url, true)
    var username  = url_parts.query.username
    user.remove(username, function() {
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify('ok'))
        response.end('\n', 'utf-8')
    })


})

app.get('/delete', function(request, response){
    var achievementId

    if (request.query.achievementId && request.query.achievementId.length > 12) {
        achievementId = request.query.achievementId
    } else {
        achievementId = request.session.current_achievement_id
    }
    achievement.Achievement.findOne({ _id: achievementId }, function(err,currentAchievement) {
        if (currentAchievement) {
            shareholding.Shareholding.findOne({ sharer_id: request.session.currentUser._id, achievement_id: currentAchievement._id }, function(err, sharehold) {
                if (sharehold != null) {
                    sharehold.remove()
                    achievement.removeSharedPartOfAchievement(currentAchievement, request.session.currentUser._id, function () {
                            shareholding.Shareholding.find({ achievement_id: currentAchievement._id, confirmed: false }, function(err, notifications) {
                                if (notifications) {
                                    var notificationsGoneThrough = 0
                                    notifications.forEach(function(notification ) {
                                        notification.remove()
                                        notificationsGoneThrough++
                                        if (notificationsGoneThrough === (notifications.length)) {
                                            response.writeHead(200, {'content-type': 'application/json' })
                                            response.write(JSON.stringify('ok'))
                                            response.end('\n', 'utf-8')
                                        }
                                    })
                                } else {
                                    response.writeHead(200, {'content-type': 'application/json' })
                                    response.write(JSON.stringify('ok'))
                                    response.end('\n', 'utf-8')
                                }
                            })

                    })
                } else {
                    shareholding.Shareholding.findOne({ shareholder_id: request.session.currentUser._id, achievement_id: currentAchievement._id }, function(err, sharedToMe) {
                        if (sharedToMe != null) {
                            sharedToMe.remove()
                        }
                        achievement.remove(currentAchievement, request.session.currentUser._id, function () {
                            response.writeHead(200, {'content-type': 'application/json' })
                            if (typeof String.prototype.startsWith != 'function') {
                                String.prototype.startsWith = function (str){
                                    return this.indexOf(str) == 0;
                                }
                            }
                            if (currentAchievement.imageURL.startsWith("https:")) {
                                response.write(JSON.stringify(currentAchievement.imageURL))
                            } else {
                                response.write(JSON.stringify('ok'))
                            }
                            response.end('\n', 'utf-8')
                        })
                    })
                }
            })
        } else {
            console.log("trying to remove non-existing achievement " + request.session.current_achievement_id)
        }
    })
})

app.get('/', function(req, res) {
    requestHandlers.writeDefaultPage(req, res)
})

app.get('/editAchievement', function(request, response){
    achievement.Achievement.findOne({ _id: request.session.current_achievement_id }, function(err,currentAchievement) {
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify(currentAchievement))
        response.end('\n', 'utf-8')
    })
})

function saveAchievement(response, motherAchievement, titles, quantities, userId) {
    var progressesToInit = new Array()
    if (titles.length === 0) {
        finalizeAchievement (response, motherAchievement, titles, quantities, progressesToInit)
    } else {
        _.each(titles, function (title, i) {
            var goalToBeCreated  = goal.prepareGoal(title, quantities[i])
            achievement.addGoalToAchievement(goalToBeCreated, motherAchievement, userId, function (progress) {
                progressesToInit.push(progress)
            })
            if (i === titles.length - 1) {
                finalizeAchievement (response, motherAchievement, titles, quantities, progressesToInit)
            }
        })
    }
}

function finalizeAchievement (response, motherAchievement, titles, quantities, progressesToInit) {
    achievement.save(motherAchievement, function(err, createdAchievementId) {
        if (err) {
            response.writeHead(400, {'content-type': 'application/json' })
            response.write(JSON.stringify(getNewAchievementErrorMessage(err)))
            response.end('\n', 'utf-8')
        } else {
            _.each(progressesToInit, function (myProgress, i) {
                myProgress.save(function (err) {})
            })
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify(createdAchievementId))
            response.end('\n', 'utf-8')
        }
    })
}

app.get('/newAchievement', function(request, response){
    var userID

    if (request.query.user_id && request.query.user_id.length > 12) {
        userID = request.query.user_id
    } else {
        userID = request.session.currentUser._id
    }
    user.User.findById(userID, function(err, user) {
        var motherAchievement;
        achievement.Achievement.findOne({ _id: request.session.current_achievement_id }, function(err,currentAchievement) {
            if(!user.isIssuer) {
                motherAchievement = achievement.createAchievement(user._id, request.query.title, request.query.description, request.query.currentImage)
            } else {
                motherAchievement = achievement.createIssuedAchievement(user._id, request.query.title, request.query.description, request.query.currentImage, user.issuerName)
            }
            var titles = JSON.parse(request.query.goalTitles)
            var quantities = request.query.goalQuantities.split(',')
            var textInQuantities = false;
            _.each(titles, function (title, i) {
                if (_.isNaN(parseInt(quantities[i]))) {
                    textInQuantities = true;
                    response.writeHead(400, {'content-type': 'application/json' })
                    response.write(JSON.stringify("That's not a number!"))
                    response.end('\n', 'utf-8')
                }
            })
            if (!textInQuantities) {
                if (currentAchievement)  {
                    achievement.remove(currentAchievement, request.session.currentUser._id, function() {
                        saveAchievement(response, motherAchievement, titles, quantities, request.session.currentUser._id)
                    })
                } else {
                    saveAchievement(response, motherAchievement, titles, quantities, request.session.currentUser._id)
                }

            }
        })
    })
})

function getNewAchievementErrorMessage (err){
    var errorMessage = "Oops, something went wrong!"
    if (err.errors) {
        if (err.errors.title) {
            if (err.errors.title.type == 'required') {
                errorMessage  = "No title, no achievement."
            }
        } else if (err.errors.goals) {
            if (err.errors.goals.type == 'required') {
                errorMessage  = "An achievement must have at least one goal."
            }
        }
    }
    return errorMessage
}

function writeGotoAppPage(response) {
    requestHandlers.gotoAppPage(response)
}

app.get('*', function(request, response){
   response.redirect("/")
})
