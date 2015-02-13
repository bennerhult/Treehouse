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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var MongoStore = require('connect-mongo')(session);

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.indexOf(str) == 0;
    }
}

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
    domain = 'http://localhost:1337/';
    console.log("Treehouse in development mode.");
    thSettings.init({
        envName : 'development',
        autoSignin : process.env.TH_AUTOSIGNIN && process.env.TH_AUTOSIGNIN.toLowerCase() === 'true',
        domain : domain
    });
} else if ('test' == env)  {
    console.log("Treehouse in test mode");
    if(!process.env.DB_URI) {
        throw "Missing environment variable DB_URI which is required in test. Should be the equivalent of 'mongodb://localhost:27017/test' when developing locally";
    }
    domain = process.env.TH_DOMAIN;
    db_uri = process.env.DB_URI;
    thSettings.init({
        envName : 'test',
        domain : domain
    });
} else if ('production' == env) {
    domain = 'http://www.treehouse.io/';
    console.log("Treehouse in prod mode.");
    db_uri=process.env.DB_URI;
    thSettings.init({
        envName : 'production',
        domain : domain
    });
}

mongoose.connect(db_uri);
app.use(cookieParser());
app.use(session({
    store: new MongoStore({
        url: db_uri,
        autoReconnect: true,
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
    achievementInstance = require('./models/achievementInstance.js'),
    progress = require('./models/progress.js'),
    shareholding = require('./models/shareholding.js'),
    loginToken = require('./models/loginToken.js'),
    requestHandlers = require('./code/requestHandlers.js')(thSettings, user),
    newsfeed = require('./models/newsfeed.js'),
    staticFiles = require('./code/staticFiles.js');

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
        res.redirect('/signin');
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
app.use('/signin', skipSigninPageIfReturningUser);
app.use('/api', publiclyAvailable);
app.use('/app', requireAccess);

app.get('/content/*', function(request, response){
    staticFiles.serve("." + request.url, response);
})

app.get('/app/content*', function(request, response){
    staticFiles.serve("." + request.url, response);
})

var auth = (function () {
    'use strict';

    function authenticateExistingUser(myUser, callback) {
        loginToken.createToken(myUser.username, function(myToken) {
            callback(null, true, { token : myToken, isNewUser : false, user : myUser });
        });
    }

    function authenticateNewUser(emailAdress, callback) {
        user.createUser(emailAdress, function (newUser, err) {
            if (err) {
                callback(err);
            }  else {
                loginToken.createToken(emailAdress, function(myToken) {
                    callback(null, true, { token : myToken, isNewUser : true, user : newUser });
                });
            }
        });
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
                        authenticateExistingUser(myUser, callback);
                    } else {
                        authenticateNewUser(email, callback);
                    }
                })
            } else {
                callback(null, false);
            }
        });
    }

    return {
        authenticate : authenticate
    };
}());

var templates = require('./code/templates.js')();
require('./code/mainPage.js')(app, requestHandlers, templates).registerHandlers();
require('./code/preSigninPage.js')(app, templates).registerHandlers();
require('./code/signinPage.js')(app, templates, requestHandlers, thSettings, user, loginToken, email, auth, url).registerHandlers();
require('./code/newsfeedPage.js')(app, templates, requestHandlers, newsfeed).registerHandlers();
require('./code/friendsPage.js')().registerHandlers();
require('./code/morePage.js')(app, templates, requestHandlers, user, thSettings, email).registerHandlers();
require('./code/achievementPage.js')(app, templates, requestHandlers, user, progress, moment, shareholding, achievementInstance, thSettings).registerHandlers();
require('./code/achievementsPage.js')(app, templates, requestHandlers, user, progress, moment, shareholding, achievementInstance).registerHandlers();
require('./code/createAchievementPage.js')(app, templates, requestHandlers, user, progress, moment, shareholding, achievementInstance, thSettings).registerHandlers();

app.get('/server-templates/*', function(request, response) {
    staticFiles.serve("." + request.url, response);
});

app.get('/robots.txt', function(request, response) {
    if(thSettings.isTest()) {
        staticFiles.serve("./test-robots.txt", response);
    } else {
        staticFiles.serve("." + request.url, response);
    }
});

app.get('/sitemap.xml', function(request, response) {
    staticFiles.serve("." + request.url, response);
});

app.get('/channel.html', function(request, response) {
    staticFiles.serve("." + request.url, response);
});

app.get('/app/*', function(request, response) {
    response.redirect("/app/newsfeed/");
});