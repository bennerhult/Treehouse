var fs = require('fs'),
    url = require('url'),
    express = require('express'),
    moment = require('moment'),
    connectmongo = require('connect-mongo'),
    _ = require("underscore")._,
    email   = require('emailjs'),
    mongoose = require('mongoose')

var db_uri = 'mongodb://localhost:27017/test'
var domain = ''

var app = express()

var server  = email.server.connect({
    user:    'pe3116x3',
    password:'wPWHEybx',
    host:    'amail3.space2u.com',
    port:    2525,
    ssl:     false
})

var MongoStore = connectmongo(express);

app.configure('development', function() {
    domain = 'http://localhost:1337/'
    console.log("Treehouse in development mode.")
})

app.configure('production', function() {
    domain = 'http://treehouse.io/'
    console.log("Treehouse in prod mode.")
    db_uri=process.env.DB_URI
})

mongoose.connect(db_uri)

app.configure(function() {
    app.use(express.cookieParser())
    app.use(express.session({
        store: new MongoStore({
            url: db_uri,
            clear_interval: 3600
        }),
        secret: 'jkdWs23321kA3kk3kk3kl1lklk1ajUUUAkd378043!sa3##21!lk4'
    }))
})

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
    if (request.session.currentUser) {
        user.User.findById(request.session.currentUser._id, function(err, user) {
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

function authenticateFromLoginToken(request, response) {
    console.log("authenticateFromLoginToken")
    if (request.cookies.rememberme)  {
        console.log("cookie found")
        var cookie = JSON.parse(request.cookies.rememberme)
        loginToken.LoginToken.findOne({ email: cookie.email }, function(err,token) {
            if (!token) {
                console.log("no token!")
                response.writeHead(404, {'content-type': 'application/json' })
                response.write(JSON.stringify(""))
                response.end('\n', 'utf-8')
            } else {
                user.User.findOne({ username: token.email.toLowerCase() }, function(err, user) {
                    if (user) {
                        request.session.currentUser = user

                        friendship.getNrOfRequests(user._id, function (nrOfFriendShipRequests) {
                            token.token = loginToken.randomToken()
                            token.save(function() {
                                request.session.nrOfFriendShipRequests = nrOfFriendShipRequests
                                response.cookie('rememberme', loginToken.cookieValue(token), { expires: new Date(Date.now() + 2 * 604800000), path: '/' })
                                //console.log("responding well: " + nrOfFriendShipRequests + ', ' + user._id)
                                response.writeHead(200, {'content-type': 'application/json' })
                                response.write(JSON.stringify(user._id))
                                response.end('\n', 'utf-8')
                            })
                        })
                    } else {
                        console.log("no user!")
                        response.writeHead(200, {'content-type': 'application/json' })
                        response.write(JSON.stringify("Bummer! We cannot find you in our records. Contact us at staff@treehouse.io if you want us to help you out."))
                        response.end('\n', 'utf-8')
                    }
                })
            }
        })
    }  else {
        console.log("no coookie found!")
        response.writeHead(404, {'content-type': 'application/json' })
        response.write(JSON.stringify(""))   //typical first sign in
        response.end('\n', 'utf-8')
    }
}

var port = process.env.PORT || 1337
app.listen(port)
console.log('Treehouse server started on port ' + port)

app.get('/content/*', function(request, response){
    //console.log("/content/*: " + request.url)
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
    console.log("/achievement")
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
   /* if (request.session.user) {
        showAchievementPage(request, response)
        console.log("yes")
    } else {   */
        progress.Progress.findOne({ achievement_id: currentAchievementId, achiever_id: userId }, function(err,currentProgress) {
            if (currentProgress && (currentProgress.publiclyVisible || loggedin))    {
                console.log("AAA")
                achievement.Achievement.findOne({ _id: currentAchievementId }, function(err,currentAchievement) {
                    request.session.current_achievement_id = currentAchievementId
                    requestHandlers.publicAchievementPage(response, userId, currentAchievementId, request.url, currentAchievement.imageURL, currentAchievement.title, currentProgress.publiclyVisible)
                })
            } else {
                console.log("BBB: " + loggedin)
                writeDefaultPage(request, response)
            }
        })
    //}

})

app.get('/', function(request, response){
    console.log("/")
    writeDefaultPage(request, response)
})

app.get('/rememberMe', function(request, response){
    console.log("rememberMe")
    authenticateFromLoginToken(request, response)
})

app.get('/checkFBUser', function(request, response){
    console.log("/checkFbUser")
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
                        console.log("/fbAppConnect: " + email)
                        console.log("/err: " + err)
                        console.log("/myUser: " + myUser)
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
    console.log("signin: " + url_parts.query.email.toLowerCase() + ", " + token)
    loginToken.LoginToken.findOne({ email: email, token: token }, function(err,myToken) {
        if (myToken) {
            console.log("finding user by email")
            user.User.findOne({ username: email }, function(err,myUser) {
                request.session.user_email = email      //TODO remove pga behövs inte längre då user ligger i session?
                getDataForUser(myUser, request, response, newUser, appMode)
            })
        }  else {
            console.log("NO TOKEN")
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
                         response.write(JSON.stringify(myToken.token))
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
                        response.writeHead(201, {'content-type': 'application/json' })
                        response.write(JSON.stringify(myToken.token))
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
    console.log("getDataForUser")
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
            console.log("exhausted link")
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify("That link is exhausted. Get a new one!"))
            response.end('\n', 'utf-8')
        }  else {
            console.log("adding user to session")
            request.session.currentUser = myUser
            //request.session.user_email = myUser.username
            loginToken.createToken(myUser.username, function(myToken) {
                response.cookie('rememberme', loginToken.cookieValue(myToken), { expires: new Date(Date.now() + 12 * 604800000), path: '/' }) //604800000 equals one week
                //friendship.getNrOfRequests(myUser._id, function (nrOfFriendShipRequests) {
                    //request.session.nrOfFriendShipRequests = nrOfFriendShipRequests
                    if (appMode) {
                        writeGotoAppPage(response)
                    } else {
                        if (fbConnect) {
                            response.writeHead(200, {'content-type': 'application/json' })
                            response.write(JSON.stringify(myUser._id))
                            response.end('\n', 'utf-8')
                        } else {
                            console.log("standard login")
                            writeDefaultPage(request, response)
                        }
                    }
                //})
            })
        }
    } else {    //Sign up
        user.createUser(email, function (newUser,err) {
            if (err) {
                response.writeHead(200, {'content-type': 'application/json' })
                response.write(JSON.stringify("Oddly enough, you already have an account. Sign in and you are good to go!"))
                response.end('\n', 'utf-8')
            }  else {
                loginToken.createToken(newUser.username, function(myToken) {
                    response.cookie('rememberme', loginToken.cookieValue(myToken), { expires: new Date(Date.now() + 12 * 604800000), path: '/' }) //604800000 equals one week
                    if (fbConnect) {
                        response.writeHead(200, {'content-type': 'application/json' })
                        response.write(JSON.stringify('ok'))
                        response.end('\n', 'utf-8')
                    } else {
                        if (appMode) {
                            writeGotoAppPage(response)
                        } else {
                            console.log("!!!!!!!!!!!!!!!!!!")
                            request.session.currentUser = newUser
                            writeDefaultPage(request, response, false)
                        }
                    }
                })
            }
        })
    }
}

app.get('/signout', function(request, response){
    console.log("/signout")
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
    } else {
        userID = request.session.currentUser._id
    }

    user.setPrettyName(userID , request.query.firstName, request.query.lastName, function(error) {
        if (error) {
            response.writeHead(404, {'content-type': 'application/json' })
        } else {
            response.writeHead(200, {'content-type': 'application/json' })
        }
        response.end('\n', 'utf-8')
    })
})


app.get('/upgradeToIssuer', function(request, response){
    user.User.findOne({ _id: request.session.currentUser._id}, function(err, issuerProspect) {
        var text = "User " + issuerProspect.username + ", id: " +  issuerProspect._id + " wants to be an issuer. Make it so. 1. Confirm that the user is really the Issuer and willing to pay the corresponding fees. 2. Change user to issuer=true 3. Give the user an issuerName."
        emailUser('staff@treehouse.io', 'Issuer Request', text, text,  function(error) {
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
                response.send('Dissociative identity disorder?', { 'Content-Type': 'application/json' }, 404)
            }  else {
                friendship.isFriendRequestExisting(foundFriend._id, request.session.currentUser._id, function (requestExists, confirmed, createdByCurrentUser) {
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
    var friendShipsGoneThrough = 0
    friendship.getPendingRequests(request.session.currentUser._id, function(pendings) {
        friendship.getFriends(request.session.currentUser._id, function(friendsList) {
            if (friendsList.length === 0) {
                var content = '<div id="friendsList"><div class="header">Friends</div><br />Add some friends!</div>'
                fillFriendsList(friendships, pendings, request.session.currentUser._id, function(content) {
                    response.writeHead(200, {'content-type': 'application/json' })
                    response.write(JSON.stringify(content))
                    response.end('\n', 'utf-8')
                })
            }  else {
                var friendId

                friendsList.forEach(function(currentFriendship) {
                    friendships.push(currentFriendship)
                    friendShipsGoneThrough++
                    if (friendShipsGoneThrough === friendsList.length) {
                        fillFriendsList(friendships, pendings, request.session.currentUser._id, function(content) {
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
    content +=   '<div id="myfriends" class="myfriends">'
    if (friendsList.length > 0) {
        friendsList.forEach(function(currentFriendship, index) {
            if (currentFriendship.friend1_id == userId) {
                currentFriendId = currentFriendship.friend2_id
            } else {
                currentFriendId = currentFriendship.friend1_id
            }
            getPrettyNameIdAndImageURL(currentFriendId, function(username, id, imageURL) {
                content +=   '<div class="itemwrap" id="friendshipid' + currentFriendship._id + '">'
                content +=   '<div class="leftcontainer"><a href="javascript:void(0)" onclick="visitFriend(\'' + id + '\', \'' + username + '\')"><img width="56" height="56" src="'+ imageURL + '" /></a></div>'
                content +=   '<div class="rightcontainer">'
                content += '<h3>'
                content +=  '<a class="headerlink" href="javascript:void(0)" onclick="visitFriend(\'' + id + '\', \'' + username + '\')">' +username + '</a>'
                content += '</h3>'
                content +=   ' <span class="remove"><a href="javascript:void(0)" onclick="removeFriendship(\'' + currentFriendship._id  + '\')">Remove</a></span>'
                content +=   '</div>'
                content +=   '<div class="clear"></div>'
                if  (index < friendsList.length - 1 || pendings.length > 0)   {
                    content +=   '<div class="separerare-part">&nbsp;</div>'
                }
                content +=   '</div>'
                if (index == friendsList.length - 1) {
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
    pendings.forEach(function(currentFriendship, index) {
        if (currentFriendship.friend1_id == userId) {
            currentFriendId = currentFriendship.friend2_id
        } else {
            currentFriendId = currentFriendship.friend1_id
        }
        getPrettyNameIdAndImageURL(currentFriendId, function(username, id, imageURL) {
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
            if  (index < pendings.length - 1)   {
                content +=   '<div class="separerare-part">&nbsp;</div>'
            }
            content +=   '</div>'
            if (index == pendings.length - 1) {
                content += '</div></div>'
                callback(content)
            }
        })

    })
}

app.get('/shareList', function(request, response){
    var friendIds = new Array()
    var userId
    if (request.session.currentUser) {
        userId = request.session.currentUser._id
    }

    friendship.getFriends(userId, function(friendsList) {
        if (friendsList.length > 0) {
            friendsList.forEach(function(currentFriendship, index) {
                if (currentFriendship.friend1_id == userId) {
                    friendIds.push(currentFriendship.friend2_id)
                } else {
                    friendIds.push(currentFriendship.friend1_id)
                }
                if (index == friendsList.length -1) {
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
                    getPrettyNameIdAndImageURL(friendsList[index], function(username, id, imageURL) {
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
        }
    })
}

app.get('/compareList', function(request, response){
    var friendIds = new Array()
    var content = ""
    var userId
    if (request.session.currentUser) {
        userId = request.session.currentUser._id
    }
    shareholding.getCompares(request.query.achievementId, userId, function(compareList) {
        if (compareList && compareList.length > 0) {
            compareList.forEach(function(currentCompare, index) {
                var myQuantityFinished = 0
                var myQuantityTotal = 0
                getPrettyNameIdAndImageURL( currentCompare.achiever_id, function(prettyName, id, imageURL) {
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
                                    content += getCompareText(prettyName, myQuantityFinished, myQuantityTotal, index, compareList.length, currentCompare.achiever_id, request.query.achievementId, myProgress.publiclyVisible, currentAchievement.title, imageURL)

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

function getCompareText(prettyName, finished, total, index, nrOfCompares, achieverId, achievementId, publiclyVisible, title, imageURL) {
    compareText = '<div class="part-achievement">'
    + '<div class="progress-container">'
    + '<h3><a class="headerlink" href="javascript:void(0)" onclick="openAchievement(\'' + achievementId + '\', \'' + achieverId + '\', ' + publiclyVisible + ', \'' + title + '\')">'
        + prettyName
    + '</a></h3>'
    + '<table border="0px">'
        + '<tr>'
            + '<td class="bararea">'
                + '<div class="progress-goal-container">'
                    + '<span class="progressbar"></span>'
                    + '<div id="progressbar-goal"><span'
        if (index==0) {
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
        compareText    += '<div class="user-image"><a href="javascript:void(0)" onclick="openAchievement(\'' + achievementId + '\', \'' + achieverId + '\', ' + publiclyVisible + ', \'' + title + '\')"><img width="56" height="56" src="' +imageURL + '" alt="Visit friend!"/></a></div>'
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
    shareholding.createShareholding(request.session.currentUser._id, request.query.friendId, request.query.achievementId, function(ok) {
        if (ok) {
            user.User.findOne({ _id: request.query.friendId }, function(err, askedFriend) {
                user.User.findOne({ _id: request.session.currentUser._id}, function(err, askingFriend) {
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
    friendship.createFriendship(request.session.currentUser._id, request.query.friendId, function(ok) {
        if (ok) {
            user.User.findOne({ _id: request.query.friendId }, function(err, askedFriend) {
                user.User.findOne({ _id: request.session.currentUser._id}, function(err, askingFriend) {
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
    //console.log("/ignoreAchievement")
    shareholding.ignoreShareHolding(request.query.achievementId, request.query.userId, function() {
        response.writeHead(200, {'content-type': 'application/json' })
        response.end('\n', 'utf-8')
    })
})


app.get('/confirmAchievement', function(request, response){
    //console.log("/confirmAchievement")
    shareholding.confirmShareHolding(request.query.achievementId, request.query.userId, function(title) {
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify(title))
        response.end('\n', 'utf-8')
    })
})

function getPrettyNameIdAndImageURL(id, callback) {
    user.getPrettyNameAndImageURL(id, function(prettyName, imageURL) {
        callback(prettyName, id, imageURL)
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
                           '<p><a class="latestAchievementLink" href="javascript:void(0)" onclick="showLatestAchievement(\'' + latestAchievement._id + '\', \'' + latestProgress.achiever_id + '\', \'' + latestAchievement.title + '\')">' + latestAchievement.title + '</a></p>' +
                           '<div><a class="latestAchievementLink" href="javascript:void(0)" onclick="showLatestAchievement(\'' + latestAchievement._id + '\', \'' + latestProgress.achiever_id + '\', \'' + latestAchievement.title + '\')"><img src="' + latestAchievement.imageURL + '" /></a></div>'
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
                + achievements[i].title
            + '\''
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

        achievementsList += '<div class="separerare-part">&nbsp;</div></div>'
    }
    return achievementsList
}


function createNotificationDesc(response, achievementsList, completedAchievements, nrOfAchievements, notifications, achieverId, lookingAtFriend) {
    var shortNames = new Array()

    for (var i in notifications) {
        user.getShortName(notifications[i].createdBy, function(prettyName) {
            shortNames.push(prettyName)
            if (shortNames.length == notifications.length) {
                var notificationsList = ""
                for (var j in notifications) {
                    if (nrOfAchievements == 0 && i == 0 && lookingAtFriend) {
                        notificationsList += "<div class='achievement'>"
                    }  else {
                        notificationsList += "<div class='achievement'>"
                    }

                    notificationsList += '<div class="container"><a href="javascript:void(0)" onclick="openShareNotification(\''
                        + notifications[j]._id
                        + '\', \''
                        + achieverId
                        + '\', \''
                        + notifications[j].createdBy
                        + '\')"><img src="'
                        + notifications[j].imageURL
                        + '" alt="'
                        + notifications[j].title
                        + '"/><span class="gradient-bg"> </span><span class="request"><div>Challenged <br/>'
                    if(shortNames[j]) {
                        notificationsList += 'by '+ shortNames[j] + ''
                    }
                    notificationsList += ' </div></span></a></div><p>'  + notifications[j].title
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
    //console.log("/achievements_inProgress")
    getAchievementList(request, response, false)
})

app.get('/achievements_completed', function(request, response){
    //console.log("/achievements_completed")
    getAchievementList(request, response, true)
})

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
            progresses.forEach(function(currentProgress, index) {
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

app.get('/achievementFromServer', function(request, response){
    showAchievementPage(request, response)
})

function showAchievementPage(request, response) {
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
        request.session.current_achievement_id = currentAchievementId

        achievement.Achievement.findOne({ _id: currentAchievementId }, function(err,currentAchievement) {
            user.User.findOne({ _id: achieverId }, function(err,currentAchiever) {
                if (request.session.currentUser) {
                    console.log("SMURF0: " + request.session.currentUser._id)
                    loadUser (request, response, function () { writeAchievementPage(response, currentAchiever, currentAchievement, request.session.currentUser._id, isNotificationView, sharerId)})
                } else if (currentAchievement && currentProgress.publiclyVisible)    {
                     console.log("SMURF1: ")
                    //writeAchievementPage(response, currentAchiever, currentAchievement, request.session.user._id, isNotificationView, sharerId)
                    writeAchievementPage(response, currentAchiever, currentAchievement, null, isNotificationView, sharerId)
                } else {
                    console.log("SMURF2")
                    writeDefaultPage(request, response)
                }

            })
        })
    })
}

function writeAchievementPage(response, achiever, currentAchievement, userId, isNotificationView, sharerId) {
    var myQuantityTotal = 0
    var myQuantityFinished = 0
    var goalTexts = []
    var achievementDesc = ''

    var checkingOtherPersonsAchievement = !(achiever._id == userId)
    //console.log("achieverId: '" + achiever._id + "'")
    console.log("userId: '" + userId + "'")
    //console.log("checkingOtherPersonsAchievement: " + checkingOtherPersonsAchievement)
    var achievementUser_id
    if (isNotificationView) {
        achievementUser_id = sharerId
    }  else {
        achievementUser_id = achiever._id
    }
    if(currentAchievement.goals) {
        getPrettyNameIdAndImageURL(currentAchievement.createdBy, function(creatorName, creatorId, creatorImageURL) {
            getPrettyNameIdAndImageURL(achiever._id, function(achieverName, achieverId, achieverImageURL) {
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
                progress.Progress.findOne({ achievement_id: currentAchievement._id, achiever_id: achiever._id}, {}, { sort: { 'latestUpdated' : -1 } }, function(err, latestProgress) {
                    currentAchievement.goals.forEach(function(goal, goalIndex) {
                        if (isNotificationView) {
                            progress.Progress.findOne({   goal_id: goal._id }, function(err,myProgress) {
                                if (err) {
                                    console.log("error in app.js 4: couldn't find progress for user " + achiever._id)
                                } else {
                                    var goalPercentageFinished = (myProgress.quantityFinished / goal.quantityTotal) * 100
                                    goalTexts.push(getGoalText(goal, currentAchievement, myProgress.quantityFinished, myProgress.latestUpdated, goalPercentageFinished, checkingOtherPersonsAchievement, goalTexts.length + 1 == currentAchievement.goals.length, isNotificationView))
                                    if (goalTexts.length == currentAchievement.goals.length) {
                                        var goalTextsText = ""
                                        goalTexts.forEach(function(goalText, index) {
                                            goalTextsText += goalText
                                            if (index == goalTexts.length - 1) {
                                                var myPercentageFinished = (myQuantityFinished / myQuantityTotal) * 100
                                                if (checkingOtherPersonsAchievement) {
                                                    achievementDesc += '<div class="achievement-info"><div class=""><div id="userarea"><img src="' + achieverImageURL + '" /><a href="javascript:void(0)" onclick="openAchievements(false, \'' + achiever._id + '\', ' + true +')">' + achieverName + '</a><p>has not accepted your challenge</p></div>'
                                                }   else {
                                                    achievementDesc += '<div class="achievement-info"><div class=""><div id="userarea"><img src="' + creatorImageURL + '" /><a href="javascript:void(0)" onclick="openAchievements(false, \'' + creatorId + '\', ' + true +')">' + creatorName + '</a><p>shared an achievement with you</p></div>'
                                                }
                                                if (!checkingOtherPersonsAchievement) {
                                                    achievementDesc += '<div class="actionmenu"><ul><li><a href="javascript:void(0)" onclick="confirmAchievement(\'' + currentAchievement._id + '\', \'' + achiever._id + '\')"><img src="content/img/challengeaccepted.png" alt="challenge accepted" /></a></li><li class=""><a href="javascript:void(0)" onclick="ignoreAchievement(\'' + currentAchievement._id + '\', \'' + achiever._id + '\')"><img src="content/img/ignore.png" alt="Ignore" /></a></li></ul></div>'
                                                }
                                                achievementDesc +=    '</div><div class="separerare"> </div><div class="textarea"><h2>'
                                                    + currentAchievement.title
                                                    + '</h2>'
                                                achievementDesc +=    '<p id="creator"> by ' + creatorName  + '</p>'
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

                                                achievementDesc += '<div id="achievement-container">'
                                                achievementDesc += goalTextsText
                                                achievementDesc += '</div><div id="sharer-container"></div><div id="comparer-container"></div>'
                                                response.write(JSON.stringify(achievementDesc), myProgress.publiclyVisible)
                                                response.end('\n', 'utf-8')
                                            }
                                        })
                                    }
                                }
                            })
                        }  else {
                            shareholding.isAchievementShared(currentAchievement._id, function(isAchievementShared) {
                                progress.Progress.findOne({ goal_id: goal._id, achiever_id: achiever._id}, function(err, myProgress) {
                                    if (err) {
                                        console.log("error in app.js 6: couldn't find progress for user " + achiever._id + ", " + err)
                                    } else {
                                        var goalPercentageFinished = (myProgress.quantityFinished / goal.quantityTotal) * 100
                                        goalTexts.push(getGoalText(goal, currentAchievement, myProgress.quantityFinished, myProgress.latestUpdated ,goalPercentageFinished, checkingOtherPersonsAchievement, goalTexts.length + 1 == currentAchievement.goals.length, isNotificationView))
                                        if (goalTexts.length == currentAchievement.goals.length) {
                                            var goalTextsText = ""
                                            goalTexts.forEach(function(goalText, index) {
                                                goalTextsText += goalText
                                                if (index == goalTexts.length - 1) {
                                                    var myPercentageFinished = (myQuantityFinished / myQuantityTotal) * 100

                                                    achievementDesc += '<div class="achievement-info"><div id="userarea"><img src="' + achiever.imageURL + '" /><a class="headerlink" href="javascript:void(0)" onclick="openAchievements(false, \'' + achiever._id + '\', ' + checkingOtherPersonsAchievement + ', \'' + achieverName + '\')">' + achieverName + '</a></div> '
                                                    if (!checkingOtherPersonsAchievement) {
                                                        achievementDesc += '<div class="actionmenu"><ul>'
                                                        if (myProgress.publiclyVisible) {
                                                            achievementDesc += '<li id="unpublicizeButton" ><a href="javascript:void(0)" onclick="unpublicize()"><img src="content/img/unpublicize.png" /></a></li>'
                                                            achievementDesc += '<li id="publicizeButton"  style="display:none"><a href="javascript:void(0)" onclick="publicize()"><img src="content/img/publicize.png" /></a></li>'
                                                        }  else {
                                                            achievementDesc += '<li id="unpublicizeButton" style="display:none"><a href="javascript:void(0)" onclick="unpublicize()"><img src="content/img/unpublicize.png" /></a></li>'
                                                            achievementDesc += '<li id="publicizeButton"><a href="javascript:void(0)" onclick="publicize()"><img src="content/img/publicize.png" /></a></li>'
                                                        }
                                                        achievementDesc += '<li id="deleteButton" class="rightalign"><a href="javascript:void(0)" onclick="deleteAchievement(\'' + achiever._id + '\')"><img src="content/img/delete.png" /></a></li>'
                                                        //if (myPercentageFinished == 0 && !isAchievementShared &&!myProgress.publiclyVisible) {
                                                        if (myPercentageFinished == 0 && !isAchievementShared) {
                                                            achievementDesc += '<li id="editButton" class="rightalign"><a href="javascript:void(0)" onclick="editAchievement(\'' + achiever._id + '\')"><img src="content/img/edit.png" /></a></li>'
                                                        }
                                                        achievementDesc += '</ul></div>'
                                                    }
                                                    achievementDesc += '<div class="separerare"> </div>'
                                                        +'<div class="textarea"><h2>'
                                                        + currentAchievement.title
                                                        + '</h2>'
                                                        if (currentAchievement.createdBy != userId){
                                                            achievementDesc += '<p id="creator"> by ' + creatorName  + '</p>'
                                                        }
                                                        achievementDesc += '<p id="achievementDescription">'
                                                        + currentAchievement.description
                                                        + '</p>'

                                                        + '</div>'
                                                        + '<div class="imagearea"><img '
                                                    if (isAchievementShared) {
                                                        achievementDesc +=  'class = "shared"'
                                                    }
                                                    achievementDesc += 'src="'
                                                        + currentAchievement.imageURL
                                                        +'" alt="'
                                                        +  currentAchievement.createdBy + ": " + currentAchievement.title
                                                        + '"/><span class="gradient-bg"></span><span class="progressbar"></span><div id="progressbar" class="progress-container"><span id="mainProgress" class="progress" style="width:'
                                                        + myPercentageFinished
                                                        + '%;"></span></div>'
                                                    if(myPercentageFinished >= 100) {
                                                        achievementDesc += '<span class="unlockedDate achievementpage"><div>Unlocked <br/>' +  moment(latestProgress.latestUpdated).format("MMM Do YYYY")  + '</div></span>'
                                                    }
                                                    achievementDesc += '</div><div class="clear"></div>'

                                                    if(!checkingOtherPersonsAchievement) {
                                                        achievementDesc += '<div id="achievementTabs"><a style="color:black" href="javascript:void(0)" onclick="progressTab()"><span id="progressTab">My progress</span></a><a style="color:black" href="javascript:void(0)" onclick="compareTab()"><span id="compareTab">Compare</span></a><a style="color:black" href="javascript:void(0)" onclick="shareTab()"><span id="shareTab">Share</span></a><div class="clear"></div></div>'
                                                    }
                                                    achievementDesc += '<div id="achievement-container">'
                                                    achievementDesc += goalTextsText
                                                    achievementDesc += '</div>'

                                                    //using public domain - localhost makes FB-like component not load since localhost is not registered as a Treehouse app domain
                                                    var achLink = "http://treehouse.io/achievement?achievementId=" + currentAchievement._id + "&userId=" + currentAchievement.createdBy

                                                    var encodedAchLink = encodeURIComponent(achLink)
                                                    achievementDesc += '<div id="sharer-container"></div><div id="compare-container"></div>'
                                                    achievementDesc += '<div id="appcontainerSocial" class="publicWrap"><div id="fbLike" style="overflow: visible">'

                                                    achievementDesc +='<iframe width="95" src="//www.facebook.com/plugins/like.php?href=' + encodedAchLink + '&amp;width&amp;layout=button_count&amp;locale=en_US&amp;action=like&amp;show_faces=true&amp;share=false&amp;height=80&amp;appId=480961688595420" scrolling="no" frameborder="0" style="border:none; overflow:hidden; height:80px;" allowTransparency="true"></iframe>'

                                                    achievementDesc += '</div><div id="fbShare"><a onclick="fbShare(\''+ currentAchievement.title + '\', \'' +  achLink +'\', \'' + currentAchievement.imageURL + '\')" href="javascript:void(0)">share</a>'
                                                    achievementDesc += '</div>'
                                                    achievementDesc += '<div id="tweetAchievement" style="overflow:visible;">'
                                                    achievementDesc += '<a href="https://twitter.com/share?url=' + encodedAchLink + '&text=' + currentAchievement.title + '" class="twitter-share-button">Tweet</a>'
                                                    achievementDesc +='<script type="text/javascript">(function() {var s = document.createElement("SCRIPT");var c = document.getElementsByTagName("script")[0];s.type = "text/javascript";s.async = true;s.src = "http://platform.twitter.com/widgets.js";c.parentNode.insertBefore(s, c);})();</script>'
                                                    achievementDesc += '</div><div class="clear"> </div></div></div>'
                                                    response.write(JSON.stringify(achievementDesc))
                                                    response.end('\n', 'utf-8')

                                                }
                                            })
                                        }
                                    }
                                })
                            })
                        }
                    })
                })
            })
        })
    }
}

function getGoalText(goal, achievement, progressNumber, latestUpdated, progressPercentage, publicView, lastGoal, isNotificationView) {
    if (!latestUpdated) {
        latestUpdated = "<span id='latestUpdated" + goal._id +"'></span>"
    }  else {
        latestUpdated = "<span id='latestUpdated" + goal._id + "'> (" +  moment(latestUpdated).format("MMM Do YYYY") + ")</span>"
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
                                            + '<div id="progressbar-goal' + goal._id + '"><span class="progress" id="progress' + goal._id + '" style="width:'
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

/*
app.get('/completedAchievementsExist', function(request, response) {
    //console.log("/completedAchievementExist")
    var completedFound = false
    var achievementIdsGoneThrough = new Array()
    var goneThroughProgresses = 0
    progress.Progress.find({ achiever_id: request.session.currentUser._id}, function(err, progresses) {
        if (err) { console.log("error in app.js 8: couldn't find any progress for user " + request.session.currentUser._id) }
        if (progresses && progresses.length > 0) {
            progresses.forEach(function(currentProgress, index) {
                achievement.Achievement.findById(currentProgress.achievement_id, function(err2, myAchievement) {
                    if (err2) { console.log("error in app.js 9: couldn't find achievement for progress " + currentProgress.achievement_id) }
                    if (myAchievement) {
                        if  (_.indexOf(achievementIdsGoneThrough, myAchievement._id.toString()) == -1) {
                            achievementIdsGoneThrough.push(myAchievement._id.toString())
                            calculateAchievementProgressFromData(myAchievement.goals, progresses, function(achievementPercentageFinished) {
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
}  */

app.get('/achievementPercentage', function(request, response){
    //console.log("/achievementPercentage")
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
    achievement.Achievement.findOne({ _id: request.session.current_achievement_id }, function(err,currentAchievement) {
        progress.markProgress(currentAchievement, request.session.currentUser._id, request.query.goalId, function(quantityFinished) {
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify(quantityFinished))
            response.end('\n', 'utf-8')
        })
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
    //console.log("/unpublicize")
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
    console.log("/deleteUser")
    var url_parts = url.parse(request.url, true)
    var username  = url_parts.query.username
    user.remove(username, function() {
        response.writeHead(200, {'content-type': 'application/json' })
        response.write(JSON.stringify('ok'))
        response.end('\n', 'utf-8')
    })


})

app.get('/delete', loadUser, function(request, response){
    achievement.Achievement.findOne({ _id: request.session.current_achievement_id }, function(err,currentAchievement) {
        if (currentAchievement) {
            shareholding.Shareholding.findOne({ sharer_id: request.session.currentUser._id, achievement_id: currentAchievement._id }, function(err, sharehold) {
                if (sharehold != null) {
                    sharehold.remove()
                    achievement.removeSharedPartOfAchievement(currentAchievement, request.session.currentUser._id, function () {
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
                }  else {       //childAchievement, shared to me
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

app.get('/editAchievement', loadUser, function(request, response){
    achievement.Achievement.findOne({ _id: request.session.current_achievement_id }, function(err,currentAchievement) {
        if (request.session.currentUser) {
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
    console.log("saving achievement")
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

    if (query.user_id && query.user_id.length > 12) {
        userID = request.query.user_id
    } else {
        userID = request.session.currentUser._id
    }
    user.User.findById(userID, function(err, user) {
        var motherAchievement;
        achievement.Achievement.findOne({ _id: request.session.current_achievement_id }, function(err,currentAchievement) {
            motherAchievement = achievement.createAchievement(user._id, request.query.title, request.query.description, request.query.currentImage)
            var titles = JSON.parse(query.goalTitles)
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
                    console.log("existing achievement")
                        achievement.remove(currentAchievement, request.session.currentUser._id, function() {
                            console.log("remove done!")
                            saveAchievement(response, motherAchievement, titles, quantities, request.session.currentUser._id)
                        })
                } else {
                    console.log("NEW!")
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

function writeDefaultPage(request, response) {
    if (request.session.currentUser) {
        console.log("000 index page")
        requestHandlers.indexPage(response, request.session.currentUser._id, request.session.nrOfFriendShipRequests)
    }   else {
        console.log("A")
        requestHandlers.indexPage(response, null, null)
    }
}

app.get('*', function(request, response){
   //console.log("*")
   response.redirect("/")
})