var fs = require('fs'),
    url = require('url'),
    express = require('express'),
    sessionMongoose = require("session-mongoose"),
    _ = require("underscore")._

app = express.createServer()

app.configure('development', function() {
    console.log("Treehouse in development mode.")
    app.set('db-uri', 'mongodb://localhost:27017/test')
})

app.configure('production', function() {
    console.log("Treehouse in prod mode.")
    app.set('db-uri', 'mongodb://treehouser:applehorsegreenwtfanything@staff.mongohq.com:10005/app4109808')
})

var mongooseSessionStore = new sessionMongoose({
    url: app.set('db-uri'),
    interval: 60000
})

app.configure(function() {
    app.use(express.cookieParser())
    app.use(express.session({ store: mongooseSessionStore, secret: 'jkdWs23321kA3kk3kk3kl1lklk1ajUUUAkd378043!sa3##21!lk4' }))
})

var dburi = app.set('db-uri')

module.exports = {
    dburi: dburi
}

var user = require('./models/user.js'),
    achievement = require('./models/achievement.js'),
    latestAchievement = require('./models/latestAchievement.js'),
    goal = require('./models/goal.js'),
    progress = require('./models/progress.js'),
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
                writeLoginPage(response)
            }
            user.User.findOne({ username: token.email.toLowerCase() }, function(err, user) {
                if (user) {
                    request.session.user_id = user.id

                    token.token = loginToken.randomToken()
                    token.save(function() {
                        response.cookie('rememberme', loginToken.cookieValue(token), { expires: new Date(Date.now() + 2 * 604800000), path: '/' })
                         if (initialCall) {
                             writeAchievementsPage(response)
                         }   else {
                             response.writeHead(200, {'content-type': 'application/json' })
                             response.write(JSON.stringify("ok"))
                             response.end('\n', 'utf-8')
                         }
                    })
                } else {
                    writeLoginPage(response)
                }
            })
        })
    }  else {
        writeLoginPage(response)
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

app.get('/', function(request, response){
    if (request.cookies.rememberme) {
        authenticateFromLoginToken(request, response, true)
    } else {
        writeLoginPage(response)
    }
})

app.get('/rememberMe', function(request, response){
    authenticateFromLoginToken  (request, response, false)
})

app.get('/checkUser', function(request, response){
    user.User.findOne({ username: request.query.username.toLowerCase(), password: request.query.password }, function(err,myUser) {
        if (myUser != null) {
            request.session.user_id = myUser._id
            request.session.user_email = myUser.username

            loginToken.createToken(myUser.username, function(myToken) {
                response.cookie('rememberme', loginToken.cookieValue(myToken), { expires: new Date(Date.now() + 2 * 604800000), path: '/' }) //604800000 equals one week
                response.write(JSON.stringify('ok'))
                response.end('\n', 'utf-8')
            });

        } else {
            request.session.destroy()
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify('You really must know the password to get in.'))
            response.end('\n', 'utf-8')
        }
    })
})

app.get('/logout', function(request, response){
    if (request.session) {
        response.clearCookie('rememberme', null)
        loginToken.remove(request.session.user_email)
        request.session.destroy()

        requestHandlers.indexPage(response)
    }
})

app.get('/signup', function(request, response){
    user.createUser(request.query.username.toLowerCase(), request.query.password, function (myUser,err) {
        if (err) {
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify(getSignupErrorMessage(err)))
            response.end('\n', 'utf-8')
        }  else {
            request.session.user_id = myUser._id
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify('ok'))
            response.end('\n', 'utf-8')
        }
    })
})

function getSignupErrorMessage (err){
    var errorMessage = "You already got an account, remember? Go log in and check your achievements."

    if (err.errors) {
        if (err.errors.username) {
            if (err.errors.username.type == 'required') {
                errorMessage  = "Hey, type an email!"
            }  else if (err.errors.username.type == 'invalid_email') {
                errorMessage  = "Is your email correct?"
            }
        } else if (err.errors.password) {
            if (err.errors.password.type == 'required') {
                errorMessage  = "You need a password!"
            }  else if (err.errors.password.type == 'too_short') {
                errorMessage  = "Come on! That password is just too short."
            }
        }
    }

    return errorMessage
}

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
            writeLoginPage(response)
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

function createAchievementDesc(achievements, userId, percentages, completed) {
    var achievementsList = ""
    for (var i in achievements) {
        if (completed && i == 0) {
            achievementsList += "<div class='achievement first'>"
        } else {
            achievementsList += "<div class='achievement'>"
        }
        achievementsList += '<div class="container"><a href="javascript:void(0)" onclick="openAchievement(\''
            + achievements[i]._id
            + '\', \''
            + userId
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
    if (!completedAchievements) {
        achievementsList += "<div class='achievement first'><div class='container'><a href='javascript:void(0)' onclick='insertContent(getNewAchievementContent())'><img src='content/img/empty.png' alt=''/></a></div><p>Create new achievement</p><div class='separerare'>&nbsp;</div></div>"
    }
    progress.Progress.find({ achiever_id: request.session.user_id}, function(err, progresses) {
        if (err) {
            console.log("error in app.js: couldn't find any progess for user " + request.session.user_id)
        }
        if (progresses && progresses.length > 0) {
            progresses.forEach(function(currentProgress, index) {
                achievement.Achievement.findById(currentProgress.achievement_id, function(err2, myAchievement) {
                    if (err2) {
                        console.log("error in app.js: couldn't find achievement for progress " + currentProgress.achievement_id)
                    }
                    if (myAchievement) {
                        if  (_.indexOf(achievementIdsGoneThrough, myAchievement._id.toString()) == -1) {
                            achievementIdsGoneThrough.push(myAchievement._id.toString())
                            calculateAchievementProgress(request.session.user_id, myAchievement._id, function(achievementPercentageFinished) {
                                if ((completedAchievements && achievementPercentageFinished == 100) || (!completedAchievements && achievementPercentageFinished < 100)) {
                                    achievementsToShow.push(myAchievement)
                                    percentages.push(achievementPercentageFinished)
                                }
                                goneThroughProgresses +=  myAchievement.goals.length
                                /*
                                console.log("--- " + myAchievement.title + " ---")
                                console.log("index:" + index)
                                console.log("goneThroughProgresses:" + goneThroughProgresses)
                                console.log("progresses.length:" + progresses.length)
                                console.log("myAchievement.goals.length: " + myAchievement.goals.length)
                                  */

                                if (goneThroughProgresses == progresses.length) {
                                    achievementsList += createAchievementDesc(achievementsToShow, request.session.user_id, percentages, completedAchievements)
                                    finishAchievementsList(response, achievementsList)
                                }
                            })
                        }
                    }
                })
            })
        } else {
            achievementsList += "<div class='achievement first'><div class='container'><a href='javascript:void(0)' onclick='insertContent(getNewAchievementContent())'><img src='content/img/empty.png' alt=''/></a></div><p>Create new achievement</p><div class='separerare'>&nbsp;</div></div>"
            finishAchievementsList(response, achievementsList)
        }
    })
}

function finishAchievementsList(response, achievementsList) {
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
            loadUser (request, response, function () { writeAchievementPage(response, request.session.user_id, currentAchievement, false)})
        } else if (currentAchievement && currentAchievement.publiclyVisible)    {
            writeAchievementPage(response, url_parts.query.userId, currentAchievement, true)
        } else {
            writeLoginPage(response)
        }
    })
})

function writeAchievementPage(response, currentUserId, currentAchievement, publicView) {
    var achievementDesc = ""
    var goalTexts = []
    var myQuantityTotal = 0
    var myQuantityFinished = 0
    if(currentAchievement.goals) {
        currentAchievement.goals.forEach(function(goal, goalIndex) {
            progress.Progress.findOne({ achiever_id:  currentUserId,  goal_id: goal._id}, function(err,myProgress) {
                myQuantityFinished += myProgress.quantityFinished
                myQuantityTotal += goal.quantityTotal
            })
        })
        currentAchievement.goals.forEach(function(goal, goalIndex) {
            progress.Progress.findOne({ achiever_id:  currentUserId,  goal_id: goal._id}, function(err,myProgress) {
                var goalPercentageFinished = (myProgress.quantityFinished / goal.quantityTotal) * 100
                goalTexts.push(getGoalText(goal, currentAchievement, myProgress.quantityFinished, goalPercentageFinished, publicView, goalTexts.length + 1 == currentAchievement.goals.length))
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
                            user.User.findOne({ _id:  currentUserId}, function(err,myUser) {
                                achievementDesc += 'Achiever: ' + myUser.username
                                achievementDesc += '</p>'
                                response.write(JSON.stringify(achievementDesc))
                                response.end('\n', 'utf-8')
                            })
                        }
                    })
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
            writeLoginPage(response)
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

function writeLoginPage(response) {
    requestHandlers.indexPage(response)
}

function writeAchievementsPage(response) {
    requestHandlers.indexPage(response)
}

app.get('*', function(request, response){
    response.redirect("/")
})