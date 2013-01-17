var fs = require('fs'),
    url = require('url'),
    express = require('express'),
    moment = require('moment'),
    sessionMongoose = require("session-mongoose"),
    _ = require("underscore")._,
    email   = require('emailjs')

var db_uri = 'mongodb://localhost:27017/test'
var domain = ''

app = express.createServer()

var server  = email.server.connect({
    user:    'pe3116x3',
    password:'wPWHEybx',
    host:    'amail3.space2u.com',
    port:    2525,
    ssl:     false
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
    shareholding = require('./models/shareholding.js'),
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
    //console.log("authenticateFromLoginToken: " + initialCall)
    if (request.cookies.rememberme)  {
        //console.log("cookie found")
        var cookie = JSON.parse(request.cookies.rememberme)
        loginToken.LoginToken.findOne({ email: cookie.email }, function(err,token) {
            if (!token) {
                response.writeHead(404, {'content-type': 'application/json' })
                response.write(JSON.stringify(""))
                response.end('\n', 'utf-8')
            } else {
                user.User.findOne({ username: token.email.toLowerCase() }, function(err, user) {
                    if (user) {
                        request.session.user_id = user.id
                        friendship.getNrOfRequests(request.session.user_id, function (nrOfFriendShipRequests) {
                            token.token = loginToken.randomToken()
                            token.save(function() {
                                response.cookie('rememberme', loginToken.cookieValue(token), { expires: new Date(Date.now() + 2 * 604800000), path: '/' })
                                //if (initialCall) {
                                //    writeDefaultPage(request, response)
                                //}   else {
                                    response.writeHead(200, {'content-type': 'application/json' })
                                    response.write(JSON.stringify(nrOfFriendShipRequests))
                                    response.end('\n', 'utf-8')
                                //}
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
        response.writeHead(404, {'content-type': 'application/json' })
        response.write(JSON.stringify(""))   //typical first sign in
        response.end('\n', 'utf-8')
    }
}

var port = process.env.PORT || 1337
app.listen(port)
console.log('Treehouse server started on port ' + port)

app.get('/content/*', function(request, response){
    //console.log("/content/*")
    staticFiles.serve("." + request.url, response)
})

app.get('/treehouse.manifest', function(request, response){
    //console.log("/treehouse.manifest")
    staticFiles.serve("." + request.url, response)
})

app.get('/channel.html', function(request, response){
    //console.log("/channel.html")
    staticFiles.serve("." + request.url, response)
})

//public achievement
app.get('/achievement', function(request, response) {
    //TODO Erik: märkligt nog verkar denna inte användas
    var url_parts = url.parse(request.url, true)
    var currentAchievementId = url_parts.query.achievementId
    var userId  = url_parts.query.userId
    //console.log("/achievement: currentAchievementId " + currentAchievementId)
    //console.log("/achievement: userId " + userId)
    progress.Progress.findOne({ achievement_id: currentAchievementId, achiever_id: userId }, function(err,currentProgress) {
        //console.log("BOOOOOOOOM! " + currentProgress )

        if (currentProgress && currentProgress.publiclyVisible)    {
            achievement.Achievement.findOne({ _id: currentAchievementId }, function(err,currentAchievement) {
                request.session.current_achievement_id = currentAchievementId
                requestHandlers.publicAchievementPage(response, userId, currentAchievementId, request.url, currentAchievement.imageURL, currentAchievement.title)
            })
        } else {
            writeDefaultPage(request, response)
        }
    })
})

app.get('/', function(request, response){
    //console.log("/")
    writeDefaultPage(request, response)
})

app.get('/rememberMe', function(request, response){
    //console.log("rememberMe")
    authenticateFromLoginToken(request, response, false)
})

app.get('/checkFBUser', function(request, response){
    //console.log("/checkFbUser")
    user.User.findOne({ username: request.query.username.toLowerCase() }, function(err,myUser) {
        getDataForUser(myUser, request, response, false)
    })
})

app.get('/fbAppConnect', function(request, response){
    //console.log("/fbAppConnect")
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
    //console.log("/signin")
    signin(request, response, false)
})

app.get('/signup', function(request, response) {
    //console.log("/signup")
    signin(request, response, true)
})

function signin(request, response, newUser) {
    var url_parts = url.parse(request.url, true)
    var email = url_parts.query.email.toLowerCase()
    var token = url_parts.query.token
    var appModeString = url_parts.query.appMode
    var appMode = (appModeString === 'true')
    //console.log("signin: " + url_parts.query.email.toLowerCase())
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
    //console.log("/checkUser")
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
                {data: html, alternative:true}
            ]
    }, function(err, message) {
        if (err) console.log("error sending email: " + err)
    })
    if (callback) callback()
}

function getDataForUser(myUser, request, response, newUser, appMode) {
    //console.log("getDataForUser")
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
    //console.log("/signout")
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

app.get('/user', function(request, response){
    user.User.findOne({ _id: request.session.user_id }, function(err,foundUser) {
        if (foundUser)    {
            response.send(foundUser, { 'Content-Type': 'application/json' }, 200)
        }
    })
})

app.get('/setPrettyName', function(request, response){
    user.setPrettyName(request.session.user_id , request.query.firstName, request.query.lastName, function(error) {
        if (error) {
            response.writeHead(404, {'content-type': 'application/json' })
        } else {
            response.writeHead(200, {'content-type': 'application/json' })
        }
        response.end('\n', 'utf-8')
    })
})

app.get('/findFriends', function(request, response){
    user.User.findOne({ username: request.query.friend_email.toLowerCase() }, function(err,foundFriend) {
        if (foundFriend)    {
            if (request.session.user_id == foundFriend._id ) {
                response.send('Dissociative identity disorder?', { 'Content-Type': 'application/json' }, 404)
            }  else {
                friendship.isFriendRequestExisting(foundFriend._id, request.session.user_id, function (requestExists, confirmed, createdByCurrentUser) {
                    var responseobject = new Object()
                    responseobject.id = foundFriend._id
                    responseobject.confirmed = confirmed
                    responseobject.createdByCurrentUser = createdByCurrentUser
                    responseobject.requestExists = requestExists
                    response.send(responseobject, { 'Content-Type': 'application/json' }, 200)
                })
            }
        } else {
            response.send(request.query.friend_email + ' does not appear to use Treehouse! Tell your friend about it and share the happiness!', { 'Content-Type': 'application/json' }, 404)
        }
    })
})

app.get('/friendsList', function(request, response){
    var friendships = new Array()
    friendship.getPendingRequests(request.session.user_id, function(pendings) {
        friendship.getFriends(request.session.user_id, function(friendsList) {
            if (friendsList.length === 0) {
                var content = '<div id="friendsList"><div class="test">Friends</div><br />Add some friends!</div>'
                fillFriendsList(friendships, pendings, request.session.user_id, function(content) {
                    response.writeHead(200, {'content-type': 'application/json' })
                    response.write(JSON.stringify(content))
                    response.end('\n', 'utf-8')
                })
            }  else {
                var friendId

                friendsList.forEach(function(currentFriendship, index) {
                    friendships.push(currentFriendship)
                    if (index == friendsList.length -1) {
                        fillFriendsList(friendships, pendings, request.session.user_id, function(content) {
                            response.writeHead(200, {'content-type': 'application/json' })
                            response.write(JSON.stringify(content))
                            response.end('\n', 'utf-8')
                        })
                    }
                })
            }
        })
    })
})

function fillFriendsList(friendsList, pendings, userId, callback) {
    var currentFriendId
    var content = '<div id="friendsList"><div class="header">Friends</div>'
    if (friendsList.length > 0) {
        friendsList.forEach(function(currentFriendship, index) {
            if (currentFriendship.friend1_id == userId) {
                currentFriendId = currentFriendship.friend2_id
            } else {
                currentFriendId = currentFriendship.friend1_id
            }
            getUserNameForId(currentFriendId, function(username, id) {
                content +=   '<div class="myfriends">'
                content +=   '<span id="friendshipid' + currentFriendship._id + '">'
                content +=    username
                content +=   ' <a style="color: #000" href="javascript:void(0)" onclick="visitFriend(\'' + id + '\')">Visit!</a>'

                content +=   ' <a style="color: #000" href="javascript:void(0)" onclick="removeFriendship(\'' + currentFriendship._id  + '\')">Remove!</a>'
                content +=   '</span>'
                if (index == friendsList.length - 1) {
                    content += '</div>'
                    content += '</div>'
                    if (pendings.length > 0) {
                        addPendings(content, pendings, userId, callback)
                    }  else {
                        callback(content)
                    }
                }
            })
        })
    } else {
        content += '</div>'
        if (pendings.length > 0) {
            addPendings(content, pendings, userId, callback)
        }  else {
            callback(content)
        }
    }

}

function addPendings(content, pendings, userId, callback) {
    var currentFriendId
    content += '<br /><br /><div id="pendingFriendshipsList"><b>Friend requests</b>'
    pendings.forEach(function(currentFriendship, index) {
        if (currentFriendship.friend1_id == userId) {
            currentFriendId = currentFriendship.friend2_id
        } else {
            currentFriendId = currentFriendship.friend1_id
        }
        getUserNameForId(currentFriendId, function(username, id) {
            content +=   '<br />'
            content +=   '<span id="friendshipid' + currentFriendship._id + '">'
            content +=    username
            content +=   ' <a style="color: #000" href="javascript:void(0)" onclick="confirmFriendRequest(\'' + currentFriendship._id + '\')">Confirm</a>'
            content +=   ' <a style="color: #000" href="javascript:void(0)" onclick="ignoreFriendRequest(\'' + currentFriendship._id + '\')">Ignore</a>'
            content +=   ' <a style="color: #000" href="javascript:void(0)" onclick="visitFriend(\'' + id + '\')">Visit</a>'
            content +=   '</span>'
            if (index == pendings.length - 1) {
                content += '</div>'
                callback(content)
            }
        })

    })
}

app.get('/shareList', function(request, response){
    var friendIds = new Array()
    friendship.getFriends(request.session.user_id, function(friendsList) {
        if (friendsList.length > 0) {
            friendsList.forEach(function(currentFriendship, index) {
                if (currentFriendship.friend1_id == request.session.user_id) {
                    friendIds.push(currentFriendship.friend2_id)
                } else {
                    friendIds.push(currentFriendship.friend1_id)
                }
                if (index == friendsList.length -1) {
                    fillShareList(friendIds, request.session.user_id, request.query.achievementId, function(content) {
                        response.writeHead(200, {'content-type': 'application/json' })
                        response.write(JSON.stringify(content))
                        response.end('\n', 'utf-8')
                    })
                }
            })
        }  else {
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify(""))
            response.end('\n', 'utf-8')
        }
    })
})

function fillShareList(friendsList, userId, achievementId, callback) {
    content = '<div id="sharerList">'
    var goneThrough= 0
    achievement.Achievement.findById( achievementId , function(err, foundAchievement) {
        if(foundAchievement.createdBy != userId) {
            content += '<p class="noshareandcompare">You can only share achievements you created yourself</p>'
            content += '</div>'
            callback(content)
        } else {
            friendsList.forEach(function(currentFriendship, index) {
                shareholding.Shareholding.findOne({ sharer_id: userId, shareholder_id: friendsList[index], achievement_id: achievementId }, function(err, alreadySharedToFriend) {
                    getUserNameForId(friendsList[index], function(username) {
                        content +=   '<div class="sharerlistitem">'
                        content +=   '<div class="leftcontainer"><img src="content/img/user_has_no_image.jpg" /></div>'
                        content +=   '<div class="rightcontainer">'
                        content +=   '<h3>'
                        content +=    username
                        content +=   '</h3>'
                        if (alreadySharedToFriend == null) {
                            content += ' <span id="shareholderid' + friendsList[index] + '"><a class="sharelink" href="javascript:void(0)" onclick="shareToFriend(\'' + friendsList[index] + '\',\'' + achievementId +  '\')">Share</a></span>'
                        } else {
                            if (alreadySharedToFriend.confirmed) {
                                content += '<p class="alreadyshared"> Already got this!</p>'
                            } else {
                                content += '<p class="alreadyshared">Share request pending!</p>'
                            }
                        }
                        content +=   '</div>'
                        content +=   '<div class="clear"></div>'
                        goneThrough++
                        if (!(goneThrough == friendsList.length)) {
                            content +=   '<div class="separerare-part">&nbsp;</div>'
                        }
                        content +=   '</div>'
                        if (goneThrough == friendsList.length) {
                            content += '</div>'
                            callback(content)
                        }
                    })
                })
            })
            if (friendsList.length == 0) {
                content += "<h3>Add some friends to have someone to share with</h3>"
                content += '</div>'
                callback(content)
            }
        }
    })
}

app.get('/compareList', function(request, response){
    var friendIds = new Array()
    var content = ""

    shareholding.getCompares(request.query.achievementId, request.session.user_id, function(compareList) {
        if (compareList && compareList.length > 0) {
            compareList.forEach(function(currentCompare, index) {
                var myQuantityFinished = 0
                var myQuantityTotal = 0
                getUserNameForId(currentCompare.achiever_id, function(userName) {
                    achievement.Achievement.findOne({ _id: request.query.achievementId }, function(err,currentAchievement) {
                        currentAchievement.goals.forEach(function(goal, goalIndex) {
                            progress.Progress.findOne({ goal_id: goal._id, achiever_id: currentCompare.achiever_id }, function(err,myProgress) {
                                if (err) {
                                    console.log("error in app.js 3: couldn't find progress for user " + currentCompare.achiever_id)
                                } else {
                                    myQuantityFinished += myProgress.quantityFinished
                                    myQuantityTotal += goal.quantityTotal
                                }

                                if (goalIndex == currentAchievement.goals.length - 1 ) {
                                    content += getCompareText(userName, myQuantityFinished, myQuantityTotal, index, compareList.length, currentCompare.achiever_id, request.query.achievementId, myProgress.publiclyVisible)

                                    if (index == compareList.length -1) {
                                        response.writeHead(200, {'content-type': 'application/json' })
                                        response.write(JSON.stringify(content))
                                        response.end('\n', 'utf-8')
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

function getCompareText(userName, finished, total, index, nrOfCompares, achieverId, achievementId, publiclyVisible) {
    compareText = '<div class="part-achievement">'
    + '<div class="progress-container">'
    + '<h3><a class="headerlink" href="javascript:void(0)" onclick="openAchievement(\'' + achievementId + '\', \'' + achieverId + '\', ' + publiclyVisible + ', ' + progressMade + ', ' + completed + ', true, true, ' + isAchievementCreatedByMe + ')">'
        + userName
    + '</a></h3>'
    + '<table border="0px">'
        + '<tr>'
            + '<td class="bararea">'
                + '<div class="progress-goal-container">'
                    + '<span class="progressbar"></span>'
                    + '<div id="progressbar-goal"><span class="progress" style="width:'
                                                + (finished/total) * 100
                                             + '%;"></span></div></div>'
            + '</td>'
            + '<td id="countarea' + goal._id + '" class="countarea">'
                + '<h3>'
        + Math.floor((finished/total) * 100)
                + '%</h3>'
            + '</td><td>&nbsp;</td><td>'
        var progressMade = finished > 0
        var completed = finished >= total
        var isAchievementCreatedByMe = false
        compareText    += '<div class="user-image"><a href="javascript:void(0)" onclick="openAchievement(\'' + achievementId + '\', \'' + achieverId + '\', ' + publiclyVisible + ', ' + progressMade + ', ' + completed + ', true, true, ' + isAchievementCreatedByMe + ')"><img src="content/img/user_has_no_image.jpg" alt="Visit friend!"/></a></div>'
        compareText += '</td></tr></table>'
        compareText    += '<div class="clear"></div>'
        compareText    += '</div>'
    if (index < nrOfCompares-1) {
        compareText += '<div class="separerare-part">&nbsp;</div>'
    }
    compareText += '</div>'
    return compareText
}

app.get('/shareToFriend', function(request, response){
    //console.log("/shareToFriend")
    shareholding.createShareholding(request.session.user_id, request.query.friendId, request.query.achievementId, function(ok) {
        if (ok) {
            user.User.findOne({ _id: request.query.friendId }, function(err, askedFriend) {
                user.User.findOne({ _id: request.session.user_id}, function(err, askingFriend) {
                    emailUser(
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
    //console.log("/addFriend")
    friendship.createFriendship(request.session.user_id, request.query.friendId, function(ok) {
        if (ok) {
            user.User.findOne({ _id: request.query.friendId }, function(err, askedFriend) {
                user.User.findOne({ _id: request.session.user_id}, function(err, askingFriend) {
                    emailUser(
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
    //console.log("/ignoreFR")
    friendship.removeFriendRequest(request.query.friendship_id, function() {
        request.session.nrOfFriendShipRequests--
        response.writeHead(200, {'content-type': 'application/json' })
        response.end('\n', 'utf-8')
    })
})

app.get('/confirmFriendRequest', function(request, response){
    //console.log("/confirmFR")
    friendship.confirmFriendRequest(request.query.friendship_id, function(friendId) {
        user.User.findOne({ _id: friendId}, function(err, foundUser) {
            var responseobject = new Object()
            responseobject.username = foundUser.username
            responseobject.id = friendId
            response.send(responseobject, { 'Content-Type': 'application/json' }, 200)
        })
    })
})

app.get('/ignoreAchievement', function(request, response){
    //console.log("/ignoreAchievement")
    shareholding.ignoreShareHolding(request.query.achievementId, request.query.userId, function() {
        response.writeHead(200, {'content-type': 'application/json' })
        response.end('\n', 'utf-8')
    })
})


app.get('/confirmAchievement', function(request, response){
    //console.log("/confirmAchievement")
    shareholding.confirmShareHolding(request.query.achievementId, request.query.userId, function() {
        response.writeHead(200, {'content-type': 'application/json' })
        response.end('\n', 'utf-8')
    })
})

function getUserNameForId(id, callback) {
    user.getPrettyName(id, function(prettyName) {
        callback(prettyName, id)
    })
}

app.get('/latestAchievementSplash', function(request, response) {
    //console.log("latestAchievementSplash")
    var latestAchievementId = latestAchievement.getId(function(latestProgressId) {
        progress.Progress.findOne({ _id: latestProgressId }, function(err,latestProgress) {
           if (latestProgress) {
               achievement.Achievement.findOne({ _id: latestProgress.achievement_id }, function(err,latestAchievement) {
                   response.writeHead(200, {'content-type': 'application/json' })
                   if (latestAchievement) {
                       content = '<h2>Latest Achievement</h2>' +
                           '<p><a href="javascript:void(0)" onclick="showLatestAchievement(\'' + latestAchievement._id + '\', \'' + latestProgress.achiever_id + '\')">' + latestAchievement.title + '</a></p>' +
                           '<div><a href="javascript:void(0)" onclick="showLatestAchievement(\'' + latestAchievement._id + '\', \'' + latestProgress.achiever_id + '\')"><img src="' + latestAchievement.imageURL + '" /></a></div>'
                   }
                   response.write(JSON.stringify(content))
                   response.end('\n', 'utf-8')
               })
           } else {
               response.writeHead(200, {'content-type': 'application/json' })
               content = '<h2>Latest Achievement</h2>'   +
                   '<p></p>' +
                   '<div></div>'
               response.write(JSON.stringify(content))
               response.end('\n', 'utf-8')
           }
        })
    })
})

function createAchievementDesc(achievements,progresses, achieverId, percentages, completed, lookingAtFriendsAchievements, sharedAchievements, isAchievementCreatedByMe) {
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
            + progresses[i].publiclyVisible
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
            + ','
            + sharedAchievements[i]
            + ', '
            + isAchievementCreatedByMe
        achievementsList += ')"><img src="'
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
            + achievements[i].title
            + '</p>'

        achievementsList += '<div class="separerare">&nbsp;</div></div>'
    }
    return achievementsList
}


function createNotificationDesc(nrOfAchievements, notifications, achieverId, lookingAtMyownAchievements) {
    var notificationsList = ""
    for (var i in notifications) {
        if (nrOfAchievements == 0 && i == 0 && !lookingAtMyownAchievements) {
            notificationsList += "<div class='achievement first'>"
        }  else {
            notificationsList += "<div class='achievement'>"
        }

        notificationsList += '<div class="container"><a href="javascript:void(0)" onclick="openShareNotification(\''
            + notifications[i]._id
            + '\', \''
            + achieverId
            + '\', \''
            + notifications[i].createdBy
            + '\','
            + false
            + ','
        notificationsList += 'false)"><img src="'
            + notifications[i].imageURL
            + '" alt="'
            + notifications[i].title
            + '"/><span class="gradient-bg"> </span></a></div><p>Share request: '
            + notifications[i].title
            + '</p><div class="separerare">&nbsp;</div></div>'
    }
    return notificationsList
}

app.get('/achievements_inProgress', function(request, response){
    //console.log("/achievments_inProgress")
    getAchievementList(request, response, false)
})

app.get('/achievements_completed', function(request, response){
    //console.log("/achievements_completed")
    getAchievementList(request, response, true)
})

function getAchievementList(request, response, completedAchievements) {
    app.set('current_achievement_id', null)
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
        achieverId = request.session.user_id
    }
    progress.Progress.find({ achiever_id: achieverId}, {}, { sort: { 'latestUpdated' : -1 } }, function(err, progresses) {
        if (err) { console.log("error in app.js 1: couldn't find any progress for user " + achieverId) }
        if (progresses && progresses.length > 0) {
            if (!lookingAtFriendsAchievements && !completedAchievements ) {achievementsList += "<div class='achievement first'><div class='container'><a href='javascript:void(0)' onclick='insertContent(getNewAchievementContent(), setCreateEditMenu())'><img src='content/img/empty.png' alt=''/></a></div><p>Create new achievement</p><div class='separerare'>&nbsp;</div></div>" }
            progresses.forEach(function(currentProgress, index) {
                achievement.Achievement.findById(currentProgress.achievement_id, function(err2, myAchievement) {
                    if (err2) { console.log("error in app.js 2: couldn't find achievement for progress " + currentProgress.achievement_id) }
                    if (myAchievement) {
                        if  (_.indexOf(achievementIdsGoneThrough, myAchievement._id.toString()) == -1) {
                            achievementIdsGoneThrough.push(myAchievement._id.toString())
                            calculateAchievementProgress(achieverId, myAchievement._id, function(achievementPercentageFinished) {
                                shareholding.isAchievementShared(myAchievement._id, function(isAchievementShared) {
                                    shareholding.isAchievementCreatedByMe(achieverId, myAchievement._id, function(isAchievementCreatedByMe) {
                                        shareholding.isAchievementSharedByMe(achieverId, myAchievement._id, function(isAchievmentSharedByMe) {
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
                                                getSharedAchievementNotifications(achievementsToShow.length, response, achievementsList, completedAchievements, achieverId, request.session.user_id)
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
            if (!lookingAtFriendsAchievements) {achievementsList += "<div class='achievement first'><div class='container'><a href='javascript:void(0)' onclick='insertContent(getNewAchievementContent(), setCreateEditMenu())'><img src='content/img/empty.png' alt=''/></a></div><p>Create new achievement</p><div class='separerare'>&nbsp;</div></div>" }
            getSharedAchievementNotifications(0, response, achievementsList, completedAchievements, achieverId, request.session.user_id)
        }
    })
}

function getSharedAchievementNotifications(nrOfAchievements, response, achievementsList, completedAchievements, achieverId, userId) {
    if (completedAchievements) {
        finishAchievementsList(response, achievementsList, completedAchievements)
    } else {
        shareholding.getSharedAchievementNotifications(achieverId, userId, function(notifications) {
            if (notifications) {
                achievementsList += createNotificationDesc(nrOfAchievements, notifications, achieverId, achieverId == userId)
            }
            finishAchievementsList(response, achievementsList, completedAchievements)
        })
    }
}

function finishAchievementsList(response, achievementsList, completedAchievements) {
    if (achievementsList.length < 1) {
        if (completedAchievements) {
            achievementsList = "<div class='achievement first'><div class='container'>Your friend has not a single shared or public completed achievement. Sad but true.</div></div>"
        }  else {
            achievementsList = "<div class='achievement first'><div class='container'>Your friend has not a single shared or public progressing achievement. Sad but true.</div></div>"
        }
    }
    response.writeHead(200, {'content-type': 'application/json' })
    response.write(JSON.stringify(achievementsList))
    response.end('\n', 'utf-8')
}

app.get('/achievementFromServer', function(request, response){
    //console.log("/achievementFromServer")
    var url_parts = url.parse(request.url, true)
    var currentAchievementId = url_parts.query.achievementId.trim()
    var isNotificationViewString = url_parts.query.isNotificationView.trim()
    var isNotificationView = (isNotificationViewString === 'true')
    var sharerId
    if (isNotificationView) {
        sharerId = url_parts.query.sharerId.trim()
    }
    var achieverId = url_parts.query.achieverId

   progress.Progress.findOne({ achievement_id: currentAchievementId, achiever_id: achieverId }, function(err,currentProgress) {
        //achievement.Achievement.findOne({ _id: currentProgress.achievement_id }, function(err,currentAchievement) {
       app.set('current_achievement_id', currentAchievementId)

       achievement.Achievement.findOne({ _id: currentAchievementId }, function(err,currentAchievement) {

            if (request.session.user_id) {
                //console.log("SMURF0")
                loadUser (request, response, function () { writeAchievementPage(response, achieverId, currentAchievement, request.session.user_id, isNotificationView, sharerId)})
            } else if (currentAchievement && currentProgress.publiclyVisible)    {
                //console.log("SMURF1")
                writeAchievementPage(response, achieverId, currentAchievement, request.session.user_id, isNotificationView, sharerId)
            } else {
                //console.log("SMURF2")
                writeDefaultPage(request, response)
            }
        })
  })

})

function writeAchievementPage(response, achieverId, currentAchievement, userId, isNotificationView, sharerId) {
    var myQuantityTotal = 0
    var myQuantityFinished = 0
    var goalTexts = []
    var achievementDesc = ''
    var checkingOtherPersonsAchievement = !(achieverId === userId)
    var achievementUser_id
    if (isNotificationView) {
        achievementUser_id = sharerId
    }  else {
        achievementUser_id = achieverId
    }

    if(currentAchievement.goals) {
        getUserNameForId(currentAchievement.createdBy, function(username) {
            currentAchievement.goals.forEach(function(goal, goalIndex) {
                progress.Progress.findOne({ goal_id: goal._id, achiever_id: achievementUser_id }, function(err,myProgress) {
                    if (err) {
                        console.log("error in app.js 3: couldn't find progress for user " + achieverId)
                    } else {
                        myQuantityFinished += myProgress.quantityFinished
                        myQuantityTotal += goal.quantityTotal
                    }
                })
            })
            progress.Progress.findOne({ achievement_id: currentAchievement._id, achiever_id: achievementUser_id}, {}, { sort: { 'latestUpdated' : -1 } }, function(err, latestProgress) {
                currentAchievement.goals.forEach(function(goal, goalIndex) {
                    if (isNotificationView) {
                        progress.Progress.findOne({   goal_id: goal._id }, function(err,myProgress) {
                            if (err) {
                                console.log("error in app.js 4: couldn't find progress for user " + achieverId)
                            } else {
                                var goalPercentageFinished = (myProgress.quantityFinished / goal.quantityTotal) * 100
                                goalTexts.push(getGoalText(goal, currentAchievement, myProgress.quantityFinished, myProgress.latestUpdated, goalPercentageFinished, checkingOtherPersonsAchievement, goalTexts.length + 1 == currentAchievement.goals.length, isNotificationView))
                                if (goalTexts.length == currentAchievement.goals.length) {
                                    var goalTextsText = ""
                                    goalTexts.forEach(function(goalText, index) {
                                        goalTextsText += goalText
                                        if (index == goalTexts.length - 1) {
                                            var myPercentageFinished = (myQuantityFinished / myQuantityTotal) * 100
                                            achievementDesc += '<div class="achievement-info"><div class="textarea"><h2>Share request: '
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

                                            if(!checkingOtherPersonsAchievement) {
                                                if(!isNotificationView) {
                                                    achievementDesc += '<a style="color:black" href="javascript:void(0)" onclick="progressTab()">Progress</a> <a style="color:black" href="javascript:void(0)" onclick="shareTab()">Share</a>'
                                                }
                                            }
                                            achievementDesc += '<div id="achievement-container">'
                                            achievementDesc += goalTextsText
                                            achievementDesc += '</div>'
                                            achievementDesc += '<div id="sharer-container"></div><div id="comparer-container"></div>'
                                            achievementDesc += '<br />'
                                            achievementDesc += '<div id="fbLike" style="overflow:visible;"><div class="fb-like" data-send="false" data-width="250" data-show-faces="true" font="segoe ui"></div></div>'
                                            achievementDesc += '<br />'
                                            achievementDesc += '<div id="tweetAchievement" style="overflow:visible;">'
                                            achievementDesc += '<a href="https://twitter.com/share' + '?text=' + currentAchievement.title + '" class="twitter-share-button">Tweet</a>'
                                            achievementDesc += '<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>'
                                            achievementDesc += '</div>'
                                            achievementDesc += '<br />'
                                            achievementDesc += '<br />'
                                            achievementDesc += '<p>'
                                            achievementDesc += 'Creator: ' + username + '<br />'
                                            getUserNameForId(achieverId, function(achieverName) {
                                                achievementDesc += 'Achiever: ' + achieverName
                                                achievementDesc += '</p>'

                                                response.write(JSON.stringify(achievementDesc))
                                                response.end('\n', 'utf-8')
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    }   else {
                        progress.Progress.findOne({ goal_id: goal._id, achiever_id: achievementUser_id}, function(err, myProgress) {
                            if (err) {
                                console.log("error in app.js 6: couldn't find progress for user " + achieverId + ", " + err)
                            } else {
                                var goalPercentageFinished = (myProgress.quantityFinished / goal.quantityTotal) * 100
                                goalTexts.push(getGoalText(goal, currentAchievement, myProgress.quantityFinished, myProgress.latestUpdated ,goalPercentageFinished, checkingOtherPersonsAchievement, goalTexts.length + 1 == currentAchievement.goals.length, isNotificationView))
                                if (goalTexts.length == currentAchievement.goals.length) {
                                    var goalTextsText = ""
                                    goalTexts.forEach(function(goalText, index) {
                                        goalTextsText += goalText
                                        if (index == goalTexts.length - 1) {
                                            var myPercentageFinished = (myQuantityFinished / myQuantityTotal) * 100
                                            achievementDesc += '<div class="achievement-info"><div class="textarea"><h2>'
                                                + currentAchievement.title
                                                + "</h2>"
                                                if(myPercentageFinished >= 100) {
                                                        achievementDesc += "<p id='unlocked'>Unlocked: " +  moment(latestProgress.latestUpdated).format("MMM Do YYYY") + "</p>"
                                                }
                                                achievementDesc += '<p id="achievementDescription">'
                                                + currentAchievement.description
                                                + '</p></div>'
                                                + '<div class="imagearea"><img src="'
                                                + currentAchievement.imageURL
                                                +'" alt="'
                                                +  currentAchievement.createdBy + ": " + currentAchievement.title
                                                + '"/><span class="gradient-bg"></span><span class="progressbar"></span><div id="progressbar" class="progress-container"><span class="progress" style="width:'
                                                + myPercentageFinished
                                                + '%;"></span></div></div><div class="clear"></div>'

                                            if(!checkingOtherPersonsAchievement) {
                                                if(!isNotificationView) {
                                                    achievementDesc += '<div id="achievementTabs"><a style="color:black" href="javascript:void(0)" onclick="progressTab()"><span id="progressTab">My progress</span></a><a style="color:black" href="javascript:void(0)" onclick="compareTab()"><span id="compareTab">Compare</span></a><a style="color:black" href="javascript:void(0)" onclick="shareTab()"><span id="shareTab">Share</span></a><div class="clear"></div></div>'
                                                }
                                            }
                                            achievementDesc += '<div id="achievement-container">'
                                            achievementDesc += goalTextsText
                                            achievementDesc += '</div>'
                                            achievementDesc += '<div id="sharer-container"></div><div id="compare-container"></div>'
                                            achievementDesc += '<br />'
                                            achievementDesc += '<div id="fbLike" style="overflow:visible;"><div class="fb-like" data-send="false" data-width="250" data-show-faces="true" font="segoe ui"></div></div>'
                                            achievementDesc += '<br />'
                                            achievementDesc += '<div id="tweetAchievement" style="overflow:visible;">'
                                            achievementDesc += '<a href="https://twitter.com/share' + '?text=' + currentAchievement.title + '" class="twitter-share-button">Tweet</a>'
                                            achievementDesc += '<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>'
                                            achievementDesc += '</div>'
                                            achievementDesc += '<br />'
                                            achievementDesc += '<br />'
                                            achievementDesc += '<p>'
                                            achievementDesc += 'Creator: ' + username + '<br />'
                                            getUserNameForId(achieverId, function(achieverName) {
                                                achievementDesc += 'Achiever: ' + achieverName
                                                achievementDesc += '</p>'

                                                response.write(JSON.stringify(achievementDesc))
                                                response.end('\n', 'utf-8')
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
            })
        })
    }
}

function getGoalText(goal, achievement, progressNumber, latestUpdated, progressPercentage, publicView, lastGoal, isNotificationView) {
    if (!latestUpdated) {
        latestUpdated = ""
    }  else {
        latestUpdated = " (" +  moment(latestUpdated).format("MMM Do YYYY") + ")";
    }
    var goalText =  '<div class="part-achievement">'
                         + '<div class="progress-container">'
                            + '<h3>'
                                + goal.title + latestUpdated
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
                                if (!isNotificationView && !publicView && progressPercentage < 100) {
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
    //console.log("/completedAchievementExist")
    var completedFound = false
    var achievementIdsGoneThrough = new Array()
    var goneThroughProgresses = 0
    progress.Progress.find({ achiever_id: request.session.user_id}, function(err, progresses) {
        if (err) { console.log("error in app.js 8: couldn't find any progress for user " + request.session.user_id) }
        if (progresses && progresses.length > 0) {
            progresses.forEach(function(currentProgress, index) {
                achievement.Achievement.findById(currentProgress.achievement_id, function(err2, myAchievement) {
                    if (err2) { console.log("error in app.js 9: couldn't find achievement for progress " + currentProgress.achievement_id) }
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
    //console.log("/achievementPercentage")
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
    //console.log("/progress")
    achievement.Achievement.findOne({ _id: app.set('current_achievement_id') }, function(err,currentAchievement) {
        progress.markProgress(currentAchievement, request.session.user_id, request.query.goalId, function(quantityFinished) {
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify(quantityFinished))
            response.end('\n', 'utf-8')
        })
    })
})

app.get('/publicize', function(request, response){
    //console.log("/publicize")
    progress.Progress.findOne({ achievement_id: app.set('current_achievement_id'), achiever_id: request.session.user_id }, function(err,currentAchievementProgress) {
        achievement.publicize(currentAchievementProgress)
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify("ok"))
        response.end('\n', 'utf-8')
    })
})

app.get('/unpublicize', function(request, response){
    //console.log("/unpublicize")
    progress.Progress.findOne({ achievement_id: app.set('current_achievement_id'), achiever_id: request.session.user_id }, function(err,currentProgress) {
        achievement.unpublicize(currentProgress)
        shareholding.isAchievementShared(app.set('current_achievement_id'), function(isShared) {
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify(isShared))
            response.end('\n', 'utf-8')
        })
    })
})

app.get('/delete', loadUser, function(request, response){
    achievement.Achievement.findOne({ _id: app.set('current_achievement_id') }, function(err,currentAchievement) {
        if (currentAchievement) {
            shareholding.Shareholding.findOne({ sharer_id: request.session.user_id, achievement_id: currentAchievement._id }, function(err, sharehold) {
                if (sharehold != null) {
                    sharehold.remove()
                    achievement.removeSharedPartOfAchievement(currentAchievement, request.session.user_id, function () {
                            shareholding.Shareholding.find({ achievement_id: currentAchievement._id, confirmed: false }, function(err, notifications) {
                                if (notifications) {
                                    notifications.forEach(function(notification, index) {
                                        notification.remove()
                                        if (index == (notifications.length - 1)) {
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
                }  else {
                    achievement.remove(currentAchievement, request.session.user_id, function () {
                        response.writeHead(200, {'content-type': 'application/json' })
                        response.write(JSON.stringify('ok'))
                        response.end('\n', 'utf-8')
                    })
                }
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
            motherAchievement = achievement.createAchievement(user._id, request.query.title, request.query.description, request.query.currentImage)
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
    //console.log("writeDefaultPage: " + request.session.user_id + ", " + request.session.nrOfFriendShipRequests)
    requestHandlers.indexPage(response, request.session.user_id, request.session.nrOfFriendShipRequests)
}

app.get('*', function(request, response){
   //console.log("*")
   response.redirect("/")
})