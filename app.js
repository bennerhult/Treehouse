var fs = require('fs'),
    url = require('url'),
    express = require('express'),
    sessionMongoose = require("session-mongoose"),
    _ = require("underscore")._,
    email   = require('emailjs')

var db_uri = 'mongodb://localhost:27017/test'
var domain = ''

app = express.createServer()

var server  = email.server.connect({
    user:    'erik.bennerhult@gmail.com',
    password:'user.User.findOne(',
    host:    'smtp.gmail.com',
    port:    465,
    ssl:     true
})

app.configure('development', function() {
    domain = 'http://localhost:1337/'
    console.log("Treehouse in development mode.")
})

app.configure('production', function() {
    domain = 'http://treehouse.io/'
    console.log("Treehouse in prod mode.")
    db_uri=process.env.DB_URI
})

var mongooseSessionStore = new sessionMongoose({
    url: db_uri,
    interval: 60000
})

app.configure(function() {
    app.use(express.cookieParser())
    app.use(express.session({ store: mongooseSessionStore, secret: 'jkdWs23321kA3kk3kk3kl1lklk1ajUUUAkd378043!sa3##21!lk4' }))
})

var dburi = db_uri

module.exports = {
    dburi: dburi
}

var user = require('./models/user.js'),
    achievement = require('./models/achievement.js'),
    latestAchievement = require('./models/latestAchievement.js'),
    goal = require('./models/goal.js'),
    progress = require('./models/progress.js'),
    friendship = require('./models/friendship.js'),
    loginToken = require('./models/loginToken.js'),
    requestHandlers = require('./code/requestHandlers.js'),
    staticFiles = require('./code/staticFiles.js')

function loadUser(request, response, next) {
    if (request.session.user_id) {
        user.User.findById(request.session.user_id, function(err, user) {
            if (user) {
                next()
            } else {
                response.writeHead(200, {'content-type': 'application/json' })
                response.write(JSON.stringify(err.message))
                response.end('\n', 'utf-8')
            }
        })
    } else {
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify("logged out 2"))
        response.end('\n', 'utf-8')
    }
}

function authenticateFromLoginToken(request, response, initialCall) {
    if (request.cookies.rememberme)  {
        var cookie = JSON.parse(request.cookies.rememberme)
        loginToken.LoginToken.findOne({ email: cookie.email }, function(err,token) {
            if (!token) {
                writeDefaultPage(request, response) //Try signing in again!
            } else {
                user.User.findOne({ username: token.email.toLowerCase() }, function(err, user) {
                    if (user) {
                        request.session.user_id = user.id
                        friendship.getNrOfRequests(request.session.user_id, function (nrOfFriendShipRequests) {
                            token.token = loginToken.randomToken()
                            token.save(function() {
                                response.cookie('rememberme', loginToken.cookieValue(token), { expires: new Date(Date.now() + 2 * 604800000), path: '/' })
                                if (initialCall) {
                                    writeDefaultPage(request, response)
                                }   else {
                                    response.writeHead(200, {'content-type': 'application/json' })
                                    response.write(JSON.stringify(nrOfFriendShipRequests))
                                    response.end('\n', 'utf-8')
                                }
                            })
                        })
                    } else {
                        response.writeHead(200, {'content-type': 'application/json' })
                        response.write(JSON.stringify("Bummer! We cannot find you in our records. Contact us at staff@treehouse.io if you want us to help you out."))
                        response.end('\n', 'utf-8')
                    }
                })
            }
        })
    }  else {
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify(""))   //typical first sign in
        response.end('\n', 'utf-8')
    }
}

var port = process.env.PORT || 1337
app.listen(port)
console.log('Treehouse server started on port ' + port)

app.get('/content/*', function(request, response){
    staticFiles.serve("." + request.url, response)
})

app.get('/treehouse.manifest', function(request, response){
    staticFiles.serve("." + request.url, response)
})

app.get('/channel.html', function(request, response){
    staticFiles.serve("." + request.url, response)
})

app.get('/', function(request, response){
    if (request.cookies.rememberme) {
        authenticateFromLoginToken(request, response, true)
    } else {
        writeDefaultPage(request, response)
    }
})

app.get('/rememberMe', function(request, response){
    authenticateFromLoginToken(request, response, false)
})

app.get('/checkFBUser', function(request, response){
    user.User.findOne({ username: request.query.username.toLowerCase() }, function(err,myUser) {
        getDataForUser(myUser, request, response, false)
    })
})

app.get('/fbAppConnect', function(request, response){
    var url_parts = url.parse(request.url, true)
    var code = url_parts.query.code
    var accessTokenLink= 'https://graph.facebook.com/oauth/access_token?client_id=480961688595420&client_secret=c0a52e2b21f053355b43ffb704e3c555&redirect_uri=http://treehouse.io/fbAppConnect&code=' + code
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
                      getDataForUser(myUser, request, response, false)
                    })
                }
            })
        }
    })
})

app.get('/signin', function(request, response) {
    signin(request, response, false)
})

app.get('/signup', function(request, response) {
    signin(request, response, true)
})

function signin(request, response, newUser) {
    var url_parts = url.parse(request.url, true)
    var email = url_parts.query.email.toLowerCase()
    var token = url_parts.query.token
    var appModeString = url_parts.query.appMode
    var appMode = (appModeString === 'true')

    loginToken.LoginToken.findOne({ email: email, token: token }, function(err,myToken) {
        if (myToken) {
            user.User.findOne({ username: email }, function(err,myUser) {
                request.session.user_email = email
                getDataForUser(myUser, request, response, newUser, appMode)
            })
        }  else {
            writeDefaultPage(request, response)
        }
    })
}

app.get('/checkUser', function(request, response){
    var username = request.query.username.toLowerCase()
    var appMode = request.query.appMode

    user.User.findOne({ username: username }, function(err,myUser) {
        if (myUser) {
            loginToken.createToken(myUser.username, function(myToken) {
                emailUser(
                    username,
                    'Sign in to Treehouse',
                    "<html>Click <a href='" + domain + "signin?email=" + username + "&token=" + myToken.token + '&appMode=' + appMode + "'>here</a> to sign in to Treehouse.</html>",
                    'Go to ' + domain + 'signin?email=' + username + '&token=' + myToken.token + '&appMode=' + appMode +  ' to sign in to Treehouse!',
                     function() {
                         response.writeHead(200, {'content-type': 'application/json' })
                         response.write(JSON.stringify('existing user'))
                         response.end('\n', 'utf-8')
                     }
                )
            })
        } else {
            loginToken.createToken(username, function(myToken) {
                emailUser(
                    username,
                    'Welcome  to Treehouse',
                    "<html>Click <a href='" + domain + "signup?email=" + username + "&token=" + myToken.token + '&appMode=' + appMode + "'>here</a> to start using Treehouse.</html>",
                    'Go to ' + domain + 'signup?email=' + username + '&token=' + myToken.token + '&appMode=' + appMode + ' to start using Treehouse!',
                    function() {
                        response.writeHead(200, {'content-type': 'application/json' })
                        response.write(JSON.stringify('new user'))
                        response.end('\n', 'utf-8')
                    }
                 )
            })
        }
    })
})

function emailUser(emailAddress, subject, html, altText, callback) {
    server.send({
        text:    altText,
        from:    'Treehouse <staff@treehouse.io>',
        to:      '<' + emailAddress + '>',
        subject: subject,
        attachment:
            [
                {data: html, alternative:true},
            ]
    }, function(err, message) {
        if (err) console.log("error sending email: " + err)
    })
    if (callback) callback()
}

function getDataForUser(myUser, request, response, newUser, appMode) {
    var email
    var fbConnect = false
    if (request.session.user_email) {  //email sign up
        email = request.session.user_email
    } else {                           //fb connect
        if (request.query.username)      {
            email = request.query.username.toLowerCase()
            fbConnect = true
        }
    }
    if (myUser != null) {   //Sign in
        if (newUser) {  //user clicked sign up email twice
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify("That link is exhausted. Get a new one!"))
            response.end('\n', 'utf-8')
        }  else {
            request.session.user_id = myUser._id
            request.session.user_email = myUser.username
            loginToken.createToken(myUser.username, function(myToken) {
                response.cookie('rememberme', loginToken.cookieValue(myToken), { expires: new Date(Date.now() + 12 * 604800000), path: '/' }) //604800000 equals one week
                friendship.getNrOfRequests(request.session.user_id, function (nrOfFriendShipRequests) {
                    request.session.nrOfFriendShipRequests = nrOfFriendShipRequests
                    if (appMode) {
                        writeGotoAppPage(response)
                    } else {
                        if (fbConnect) {
                            response.writeHead(200, {'content-type': 'application/json' })
                            response.write(JSON.stringify(nrOfFriendShipRequests))
                            response.end('\n', 'utf-8')
                        } else {
                            writeDefaultPage(request, response)
                        }
                    }
                })
            })
        }
    } else {    //Sign up
        user.createUser(email, function (myUser,err) {
            if (err) {
                response.writeHead(200, {'content-type': 'application/json' })
                response.write(JSON.stringify("Oddly enough, you already have an account. Sign in and you are good to go!"))
                response.end('\n', 'utf-8')
            }  else {
                request.session.user_id = myUser._id
                loginToken.createToken(myUser.username, function(myToken) {
                    response.cookie('rememberme', loginToken.cookieValue(myToken), { expires: new Date(Date.now() + 12 * 604800000), path: '/' }) //604800000 equals one week
                    if (fbConnect) {
                        response.writeHead(200, {'content-type': 'application/json' })
                        response.write(JSON.stringify('ok'))
                        response.end('\n', 'utf-8')
                    } else {
                        if (appMode) {
                            writeGotoAppPage(response)
                        } else {
                            writeDefaultPage(request, response)
                        }
                    }
                })
            }
        })
    }
}

app.get('/signout', function(request, response){
    if (request.session) {
        response.clearCookie('rememberme', null)
        loginToken.remove(request.session.user_email)
        request.session.destroy()
        requestHandlers.indexPage(response, null)
    }
})


function getSignupErrorMessage (err){
    var errorMessage = "Is that really you?"
    if (err.errors) {
        if (err.errors.username) {
            if (err.errors.username.type == 'required') {
                errorMessage  = "Hey, type an email!"
            }  else if (err.errors.username.type == 'invalid_email') {
                errorMessage  = "Is your email correct?"
            }
        }
    }
    return errorMessage
}

app.get('/findFriends', function(request, response){
    user.User.findOne({ username: request.query.friend_email.toLowerCase() }, function(err,foundFriend) {
        if (foundFriend)    {
            if (request.session.user_id == foundFriend._id ) {
                response.send('Dissociative identity disorder?', { 'Content-Type': 'application/json' }, 404)
            }  else {
                friendship.isFriendRequestExisting(foundFriend._id, request.session.user_id, function (requestExists) {
                    var responseobject = new Object()
                    responseobject.id = foundFriend._id
                    responseobject.requestExists = requestExists
                    response.send(responseobject, { 'Content-Type': 'application/json' }, 200)
                })
            }
        } else {
            response.send(request.query.friend_email + ' does not appear to use Treehouse! Tell your friend about it and share the happiness!', { 'Content-Type': 'application/json' }, 404)
        }
    })
})


app.get('/addFriend', function(request, response){
    friendship.createFriendship(request.session.user_id, request.query.friendId, function(ok) {
        if (ok) {
            response.writeHead(200, {'content-type': 'application/json' })
            response.end('\n', 'utf-8')
        } else {
            response.writeHead(404, {'content-type': 'application/json' })
            response.end('\n', 'utf-8')
        }

    })


})

//public achievement
app.get('/achievement', function(request, response) {
    var url_parts = url.parse(request.url, true)
    var currentAchievementId = url_parts.query.achievementId
    request.session.current_achievement_id = currentAchievementId
    achievement.Achievement.findOne({ _id: currentAchievementId }, function(err,currentAchievement) {
        if (currentAchievement && currentAchievement.publiclyVisible)    {
            var userId  = url_parts.query.userId
            requestHandlers.publicAchievementPage(response, userId, currentAchievementId, request.url, currentAchievement.imageURL, currentAchievement.title)
        } else {
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify("Nice try, but no hacking allowed. Ok?"))
            response.end('\n', 'utf-8')
        }
    })
})

app.get('/latestAchievementSplash', function(request, response) {
    var latestAchievementId = latestAchievement.getId(function(latestAchievementId) {
        achievement.Achievement.findOne({ _id: latestAchievementId }, function(err,latestAchievement) {
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify(latestAchievement))
            response.end('\n', 'utf-8')
        })
     })

})

app.get('/latestAchievementId', function(request, response) {
    var latestAchievementId = latestAchievement.getId(function(latestAchievementId) {
         response.writeHead(200, {'content-type': 'application/json' })
        if(latestAchievementId) {
            response.write(JSON.stringify(latestAchievementId))
        }
        response.end('\n', 'utf-8')
    })
})

function createAchievementDesc(achievements, achieverId, percentages, completed, lookingAtFriendsAchievements) {
    var achievementsList = ""
    for (var i in achievements) {
        if ((completed || lookingAtFriendsAchievements) && i == 0) {
            achievementsList += "<div class='achievement first'>"
        } else {
            achievementsList += "<div class='achievement'>"
        }
        achievementsList += '<div class="container"><a href="javascript:void(0)" onclick="openAchievement(\''
            + achievements[i]._id
            + '\', \''
            + achieverId
            + '\','
            + achievements[i].publiclyVisible
            + ','
        if (percentages[i] > 0) {
            achievementsList += 'true'
        } else {
            achievementsList += 'false'
        }
        achievementsList += ','
            + completed
            + ','
            + lookingAtFriendsAchievements
        achievementsList += ')"><img src="'
            + achievements[i].imageURL
            + '" alt="'
            + achievements[i].title
            + '"/><span class="gradient-bg"> </span><span class="progressbar"> </span><div class="progress-container-achievements"><span class="progress" style="width:'
            + percentages[i]
            + '%"> </span></div></a></div><p>'
            + achievements[i].title
            + '</p><div class="separerare">&nbsp;</div></div>'
    }
    return achievementsList
}

app.get('/achievements_inProgress', function(request, response){
    getAchievementList(request, response, false)
})

app.get('/achievements_completed', function(request, response){
    getAchievementList(request, response, true)
})

function getAchievementList(request, response, completedAchievements) {
    app.set('current_achievement_id', null)
    var achievementsList = ""
    var goneThroughProgresses = 0
    var achievementsToShow = new Array()
    var achievementIdsGoneThrough = new Array()
    var percentages = new Array()
    var lookingAtFriendsAchievements = (request.query.lookingAtFriend === 'true')
    var achieverId
    if (lookingAtFriendsAchievements) {
        achieverId = request.query.achieverId
    } else {
        achieverId = request.session.user_id
    }
    progress.Progress.find({ achiever_id: achieverId}, function(err, progresses) {
        if (err) { console.log("error in app.js: couldn't find any progress for user " + achieverId) }
        if (progresses && progresses.length > 0) {
            if (!lookingAtFriendsAchievements && !completedAchievements ) { achievementsList += "<div class='achievement first'><div class='container'><a href='javascript:void(0)' onclick='insertContent(getNewAchievementContent(), setCreateEditMenu())'><img src='content/img/empty.png' alt=''/></a></div><p>Create new achievement</p><div class='separerare'>&nbsp;</div></div>" }
            progresses.forEach(function(currentProgress, index) {
                achievement.Achievement.findById(currentProgress.achievement_id, function(err2, myAchievement) {
                    if (err2) { console.log("error in app.js: couldn't find achievement for progress " + currentProgress.achievement_id) }
                    if (myAchievement) {
                        if  (_.indexOf(achievementIdsGoneThrough, myAchievement._id.toString()) == -1) {

                                achievementIdsGoneThrough.push(myAchievement._id.toString())
                                calculateAchievementProgress(achieverId, myAchievement._id, function(achievementPercentageFinished) {
                                    if(!lookingAtFriendsAchievements || myAchievement.publiclyVisible) {
                                        if ((completedAchievements && achievementPercentageFinished == 100) || (!completedAchievements && achievementPercentageFinished < 100)) {
                                            achievementsToShow.push(myAchievement)
                                            percentages.push(achievementPercentageFinished)
                                        }
                                    }
                                    goneThroughProgresses +=  myAchievement.goals.length
                                    if (goneThroughProgresses == progresses.length) {
                                        achievementsList += createAchievementDesc(achievementsToShow, achieverId, percentages, completedAchievements, lookingAtFriendsAchievements)
                                        finishAchievementsList(response, achievementsList, completedAchievements)
                                    }
                                })
                            }

                    }
                })
            })
        } else {
            achievementsList += "<div class='achievement first'><div class='container'><a href='javascript:void(0)' onclick='insertContent(getNewAchievementContent(), setCreateEditMenu())'><img src='content/img/empty.png' alt=''/></a></div><p>Create new achievement</p><div class='separerare'>&nbsp;</div></div>"
            finishAchievementsList(response, achievementsList, completedAchievements)
        }
    })
}

function finishAchievementsList(response, achievementsList, completedAchievements) {
    if (achievementsList.length < 1) {
        if (completedAchievements) {
            achievementsList = "<div class='achievement first'><div class='container'>Your friend has not a single shared completed achievement. Sad but true.</div></div>"
        }  else {
            achievementsList = "<div class='achievement first'><div class='container'>Your friend has not a single shared progressing achievement. Sad but true.</div></div>"
        }
    }
    response.writeHead(200, {'content-type': 'application/json' })
    response.write(JSON.stringify(achievementsList))
    response.end('\n', 'utf-8')
}

app.get('/achievementFromServer', function(request, response){
    var url_parts = url.parse(request.url, true)
    var currentAchievementId = url_parts.query.achievementId.trim()
    app.set('current_achievement_id', currentAchievementId)
    achievement.Achievement.findOne({ _id: currentAchievementId }, function(err,currentAchievement) {
        if (request.session.user_id) {
            loadUser (request, response, function () { writeAchievementPage(response, url_parts.query.userId, currentAchievement, request.session.user_id)})
        } else if (currentAchievement && currentAchievement.publiclyVisible)    {
            writeAchievementPage(response, url_parts.query.userId, currentAchievement, request.session.user_id)
        } else {
            writeDefaultPage(request, response)
        }
    })
})

function writeAchievementPage(response, currentViewedAchieverId, currentAchievement, userId) {
    var achievementDesc = ""
    var goalTexts = []
    var myQuantityTotal = 0
    var myQuantityFinished = 0
    var checkingOtherPersonsAchievement = currentViewedAchieverId === userId
    if(currentAchievement.goals) {
        currentAchievement.goals.forEach(function(goal, goalIndex) {
            progress.Progress.findOne({ goal_id: goal._id}, function(err,myProgress) {
                if (err) {
                    console.log("error in app.js: couldn't find progress for user " + currentViewedAchieverId)
                } else {
                    myQuantityFinished += myProgress.quantityFinished
                    myQuantityTotal += goal.quantityTotal
                }
            })
        })
        currentAchievement.goals.forEach(function(goal, goalIndex) {
            progress.Progress.findOne({   goal_id: goal._id}, function(err,myProgress) {
                if (err) {
                    console.log("error in app.js: couldn't find progress for user " + currentViewedAchieverId)
                } else {
                    var goalPercentageFinished = (myProgress.quantityFinished / goal.quantityTotal) * 100
                    goalTexts.push(getGoalText(goal, currentAchievement, myProgress.quantityFinished, goalPercentageFinished, checkingOtherPersonsAchievement, goalTexts.length + 1 == currentAchievement.goals.length))
                    if (goalTexts.length == currentAchievement.goals.length) {
                        var goalTextsText = ""
                        goalTexts.forEach(function(goalText, index) {
                            goalTextsText += goalText
                            if (index == goalTexts.length - 1) {
                                var myPercentageFinished = (myQuantityFinished / myQuantityTotal) * 100
                                achievementDesc += '<div class="achievement-info"><div class="textarea"><h2>'
                                    + currentAchievement.title
                                    + '</h2><p id="achievementDescription">'
                                    + currentAchievement.description
                                    + '</p></div>'
                                    + '<div class="imagearea"><img src="'
                                    + currentAchievement.imageURL
                                    +'" alt="'
                                    +  currentAchievement.createdBy + ": " + currentAchievement.title
                                    + '"/><span class="gradient-bg"></span><span class="progressbar"></span><div id="progressbar" class="progress-container"><span class="progress" style="width:'
                                    + myPercentageFinished
                                    + '%;"></span></div></div><div class="clear"></div>'
                                achievementDesc += '<div id="achievement-container">'
                                achievementDesc += goalTextsText
                                achievementDesc += '</div>'
                                achievementDesc += '<br />'
                                achievementDesc += '<div id="fbLike" style="overflow:visible;"><div class="fb-like" data-send="false" data-width="250" data-show-faces="true" font="segoe ui"></div></div>'
                                achievementDesc += '<br />'
                                achievementDesc += '<br />'
                                achievementDesc += '<p>'
                                achievementDesc += 'Creator: ' + currentAchievement.createdBy + '<br />'
                                user.User.findOne({ _id:  currentViewedAchieverId}, function(err2,myUser) {
                                    if (err2) {
                                        console.log("error in app.js: couldn't find user " + currentViewedAchieverId)
                                    } else {
                                        achievementDesc += 'Achiever: ' + myUser.username
                                    }
                                    achievementDesc += '</p>'

                                    response.write(JSON.stringify(achievementDesc))
                                    response.end('\n', 'utf-8')
                                })
                            }
                        })
                    }
                }
            })
        })
    }
}

function getGoalText(goal, achievement, progressNumber, progressPercentage, publicView, lastGoal) {
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
                                            + '<div id="progressbar-goal' + goal._id + '"><span class="progress" style="width:'
                                                + progressPercentage
                                             + '%;"></span></div></div>'
                                    + '</td>'
                                    + '<td id="countarea' + goal._id + '" class="countarea">'
                                        + '<h3>'
                                        + progressNumber
                                        + '/'
                                        + goal.quantityTotal
                                        + '</h3>'
                                    + '</td><td>'
                                goalText    += '<div id="addbutton' + goal._id + '" class="addbutton">'
                                if (!publicView && progressPercentage < 100) {
                                    goalText    += '<a href="javascript:void(0)" onclick="progress(\'' + goal._id + '\', \'' +  goal.quantityTotal + '\')">'
                                        + '<img src="content/img/+.png" alt="I did it!"/>'
                                        + '</a>'
                                }
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

app.get('/completedAchievementsExist', function(request, response) {
    var completedFound = false
    var achievementIdsGoneThrough = new Array()
    var goneThroughProgresses = 0
    progress.Progress.find({ achiever_id: request.session.user_id}, function(err, progresses) {
        if (err) { console.log("error in app.js: couldn't find any progress for user " + request.session.user_id) }
        if (progresses && progresses.length > 0) {
            progresses.forEach(function(currentProgress, index) {
                achievement.Achievement.findById(currentProgress.achievement_id, function(err2, myAchievement) {
                    if (err2) { console.log("error in app.js: couldn't find achievement for progress " + currentProgress.achievement_id) }
                    if (myAchievement) {
                        if  (_.indexOf(achievementIdsGoneThrough, myAchievement._id.toString()) == -1) {
                            achievementIdsGoneThrough.push(myAchievement._id.toString())
                            calculateAchievementProgress(request.session.user_id, myAchievement._id, function(achievementPercentageFinished) {
                                if(achievementPercentageFinished >= 100) {
                                    completedFound = true
                                }
                                goneThroughProgresses +=  myAchievement.goals.length
                                if (goneThroughProgresses == progresses.length) {
                                    finishCompletedAchievementsExist(response, completedFound)
                                }
                            })
                        }
                    }
                })
            })
        } else {
            finishCompletedAchievementsExist(response, false)
        }
    })

})

function finishCompletedAchievementsExist(response, completedFound) {
    response.writeHead(200, {'content-type': 'application/json' })
    if (completedFound) {
        response.write(JSON.stringify(true))
    } else {
        response.write(JSON.stringify(false))
    }
    response.end('\n', 'utf-8')
}

app.get('/achievementPercentage', function(request, response){
    calculateAchievementProgress(request.session.user_id, app.set('current_achievement_id'), function(achievementPercentageFinished) {
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify(achievementPercentageFinished))
        response.end('\n', 'utf-8')
    })
})


function calculateAchievementProgress(userId, achievementId, callback) {
    var achievementCurrentProgress = 0
    var achievementTotalProgress = 0
    achievement.Achievement.findOne({ _id: achievementId }, function(err,currentAchievement) {
        currentAchievement.goals.forEach(function(goal, goalIndex) {
            achievementTotalProgress += goal.quantityTotal
            progress.Progress.findOne({ achiever_id:  userId,  goal_id: goal._id}, function(err,myProgress) {
                achievementCurrentProgress += myProgress.quantityFinished
                if (goalIndex == currentAchievement.goals.length -1) {
                    var achievementPercentageFinished = (achievementCurrentProgress/ achievementTotalProgress) * 100
                    callback(achievementPercentageFinished)
                }
            })
        })
    })
}

app.get('/progress', function(request, response){
    progress.markProgress(request.session.user_id, request.query.goalId, function(quantityFinished) {
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify(quantityFinished))
        response.end('\n', 'utf-8')
    })
})

app.get('/publicize', function(request, response){
    achievement.Achievement.findOne({ _id: app.set('current_achievement_id') }, function(err,currentAchievement) {
        achievement.publicize(currentAchievement)
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify("ok"))
        response.end('\n', 'utf-8')
    })
})

app.get('/delete', loadUser, function(request, response){
    achievement.Achievement.findOne({ _id: app.set('current_achievement_id') }, function(err,currentAchievement) {
        if (currentAchievement)    {
            achievement.remove(currentAchievement, request.session.user_id, function () {
                response.writeHead(200, {'content-type': 'application/json' })
                response.write(JSON.stringify('ok'))
                response.end('\n', 'utf-8')
            })
        } else {
            console.log("trying to remove non-existing achievement " + app.set('current_achievement_id'))
        }
    })
})

app.get('/editAchievement', loadUser, function(request, response){
    achievement.Achievement.findOne({ _id: app.set('current_achievement_id') }, function(err,currentAchievement) {
        if (request.session.user_id) {
            loadUser (request, response, function () {
                response.writeHead(200, {'content-type': 'application/json' })
                response.write(JSON.stringify(currentAchievement))
                response.end('\n', 'utf-8')
            })
        } else {
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify("You got thrown out! Sign in again."))
            response.end('\n', 'utf-8')
        }
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
    achievement.save(motherAchievement, function(err) {
        if (err) {
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify(getNewAchievementErrorMessage(err)))
            response.end('\n', 'utf-8')
        } else {
            _.each(progressesToInit, function (myProgress, i) {
                myProgress.save(function (err) {})
            })
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify('ok'))
            response.end('\n', 'utf-8')
        }
    })
}

app.get('/newAchievement', function(request, response){
    user.User.findById(request.session.user_id, function(err, user) {

        var motherAchievement;
        achievement.Achievement.findOne({ _id: app.set('current_achievement_id') }, function(err,currentAchievement) {
            motherAchievement = achievement.createAchievement(user.username, request.query.title, request.query.description, request.query.currentImage)
            var titles= JSON.parse(request.query.goalTitles)
            var quantities=request.query.goalQuantities.split(',')
            var textInQuantities = false;
            _.each(titles, function (title, i) {
                if (_.isNaN(parseInt(quantities[i]))) {
                    textInQuantities = true;
                    response.writeHead(200, {'content-type': 'application/json' })
                    response.write(JSON.stringify("That's not a number!"))
                    response.end('\n', 'utf-8')
                }
            })
            if (!textInQuantities) {
                if (currentAchievement)  {
                        achievement.remove(currentAchievement, request.session.user_id, function() {
                            saveAchievement(response, motherAchievement, titles, quantities, request.session.user_id)
                        })
                } else {
                    saveAchievement(response, motherAchievement, titles, quantities, request.session.user_id)
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

function writeDefaultPage(request, response) {
    requestHandlers.indexPage(response, request.session.user_id, request.session.nrOfFriendShipRequests)
}

app.get('*', function(request, response){
   response.redirect("/")
})