var fs = require('fs'),
    url = require('url'),
    express = require('express'),
    sessionMongoose = require("session-mongoose");

app = express.createServer();

app.configure('development', function() {
    console.log("Treehouse in development mode.");
    app.set('db-uri', 'mongodb://localhost:27017/test');
});

app.configure('production', function() {
    console.log("Treehouse in production mode.");
    app.set('db-uri', 'mongodb://treehouser:applehorsegreenwtfanything@staff.mongohq.com:10005/app4109808');
});

var mongooseSessionStore = new sessionMongoose({
    url: app.set('db-uri'),
    interval: 60000
});

app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.cookieParser());

    app.use(express.favicon('/content/favicon.ico'));
    app.use(express.session({ store: mongooseSessionStore, secret: 'jkdWs23321kA3kk3kk3kl1lklk1ajUUUAkd378043!sa3##21!lk4' }));
    app.use(app.router);
});

var dburi = app.set('db-uri');

module.exports = {
    dburi: dburi
};

var user = require('./models/user.js'),
    achievement = require('./models/achievement.js'),
    goal = require('./models/goal.js'),
    progress = require('./models/progress.js');
    requestHandlers = require('./code/requestHandlers.js');
    staticFiles = require('./code/staticFiles.js');

function loadUser(request, response, next) {
    if (request.session.user_id) {
        user.User.findById(request.session.user_id, function(err, user) {
            if (user) {
                next();
            } else {
                console.log("logged out 1")
                response.writeHead(200, {'content-type': 'application/json' });
                response.write(JSON.stringify(err.message));
                response.end('\n', 'utf-8');
            }
        });
    } else {
        console.log("logged out 2")
        response.writeHead(200, {'content-type': 'application/json' });
        response.write(JSON.stringify("logged out 2"));
        response.end('\n', 'utf-8');
    }
}

var port = process.env.PORT || 1337;
app.listen(port);
console.log('Treehouse server started on port ' + port);

app.get('/content/*', function(request, response){
    staticFiles.serve("." + request.url, response)   ;
});

app.get('/', function(request, response){
    writeLoginPage(response);
});

app.get('/checkUser', function(request, response){
    user.User.findOne({ username: request.query.username.toLowerCase(), password: request.query.password }, function(err,myUser) {
        if (myUser != null) {
            request.session.user_id = myUser._id;
            response.writeHead(200, {'content-type': 'application/json' });
            response.write(JSON.stringify('ok'));
            response.end('\n', 'utf-8');
        } else {
            request.session.destroy();
            response.writeHead(200, {'content-type': 'application/json' });
            response.write(JSON.stringify('Username or password unknown.'));
            response.end('\n', 'utf-8');
    }
    });
});

app.get('/logout', function(request, response){
    request.session.destroy();
});

app.get('/signup', function(request, response){
    user.createUser(request.query.username.toLowerCase(), request.query.password, function (myUser,err) {
        if (err) {
            response.writeHead(200, {'content-type': 'application/json' });
            response.write(JSON.stringify(err.message));
            response.end('\n', 'utf-8');
        }  else {
            request.session.user_id = myUser._id;
            response.writeHead(200, {'content-type': 'application/json' });
            response.write(JSON.stringify('ok'));
            response.end('\n', 'utf-8');
        }
    });
});

app.get('/achievements', function(request, response){
    var achievementsList = "";
    progress.Progress.find({ achiever_id: request.session.user_id}, function(err, progresses) {
        if (progresses && progresses.length > 0) {
            progresses.forEach(function(currentProgress, index) {
                achievement.Achievement.findById(currentProgress.achievement_id, function(err, myAchievement) {
                    var myQuantityTotal = 0;
                    var myQuantityFinished = 0;
                    myAchievement.goals.forEach(function(goal, index2) {
                        myQuantityTotal += goal.quantityTotal;
                        myQuantityFinished += currentProgress.quantityFinished;
                        if (index2 == myAchievement.goals.length -1) {
                            var myPercentageFinished = (myQuantityFinished / myQuantityTotal) * 100;
                            if (index == 0) {
                                achievementsList += "<div class='achievement first'>";
                            }  else  {
                                achievementsList += "<div class='achievement'>";
                            }
                            achievementsList += '<div class="container"><a href="javascript:void(0)" onclick="insertContent(openAchievement(\''
                                + myAchievement._id
                                + '\', \''
                                + request.session.user_id
                                + '\'))"><img src="content/img/defaultImage.png" alt="'
                                + myAchievement.title
                                + '"/><span class="gradient-bg"> </span><span class="progressbar"> </span><div class="progress-container-achievements"><span class="progress" style="width:'
                                + myPercentageFinished
                                + '%"> </span></div></a></div><p>'
                                + myAchievement.title
                                + '</p><div class="separerare">&nbsp;</div></div>';
                            if (index == progresses.length -1) {
                                achievementsList += "<div class='achievement'><div class='container'><a href='javascript:void(0)' onclick='insertContent(getNewAchievementContent())'><img src='content/img/empty.png' alt=''/></a></div><p>Create new achievement</p><div class='separerare'>&nbsp;</div></div>";
                                finishAchievementsList(response, achievementsList);
                            }
                        }
                    });

                });
            });
        } else {
            achievementsList += "<div class='achievement first'><div class='container'><a href='javascript:void(0)' onclick='insertContent(getNewAchievementContent())'><img src='content/img/empty.png' alt=''/></a></div><p>Create new achievement</p><div class='separerare'>&nbsp;</div></div>";
            finishAchievementsList(response, achievementsList);
        }
    });
});

function finishAchievementsList(response, achievementsList) {
    response.writeHead(200, {'content-type': 'application/json' });
    response.write(JSON.stringify(achievementsList));
    response.end('\n', 'utf-8');
}

app.get('/achievement', function(request, response){
    response.writeHead(200, {'content-type': 'application/json' });
    var url_parts = url.parse(request.url, true);
    var currentAchievementId = url_parts.query.achievementId.trim();
    app.set('current_achievement_id', currentAchievementId);

    achievement.Achievement.findOne({ _id: currentAchievementId }, function(err,currentAchievement) {
        if (request.session.user_id) {
            loadUser (request, response, function () { writeAchievementPage(response, request.session.user_id, currentAchievement, false)});
        } else if (currentAchievement.publiclyVisible)    {
            writeAchievementPage(response, url_parts.query.userId, currentAchievement, true);
        } else {
            response.write(JSON.stringify("login")); //TODO: make this goto login page on client
            response.end('\n', 'utf-8');
        }

    });

});

function writeAchievementPage(response, currentUserId, currentAchievement, publicView) {
    var achievementDesc = "";
    achievementDesc += "var currentUserId =  '" + currentUserId + "';";   //TODO: remove these and use session variables
    achievementDesc += "var currentAchievementId =  '" + currentAchievement._id + "'</script>";    //TODO: remove these and use session variables
    achievementDesc += "<meta property='og:title' content='Treehouse: " + currentAchievement.title + "'/>";
    achievementDesc += "<meta property='og:type' content='article'/>";
    achievementDesc += "<meta property='og:image' content='http://treehouse.io/content/img/image-1.png'/>";
    achievementDesc += "<meta property='og:url' content='www.treehouse.io/achievement?achievementId=" + currentAchievement._id +"&userId=" + currentUserId + "'/>";

    if (publicView)  {
        response.write(achievementPublicPage2); //TODO: fix public page
    }/*    else {
        response.write(achievementPage2);
    }  */

    createAchievementDesc(response, currentUserId, currentAchievement, publicView, achievementDesc);
}

function createAchievementDesc (response, currentUserId, myAchievement, publicView, achievementDesc) {
    var goalTexts = [];
    if(myAchievement.goals) {
        myAchievement.goals.forEach(function(goal) {
            progress.Progress.findOne({ achiever_id:  currentUserId,  goal_id: goal._id}, function(err,myProgress) {
                var myPercentageFinished = (myProgress.quantityFinished / goal.quantityTotal) * 100;
                goalTexts.push(getGoalText(goal, myAchievement, myProgress.quantityFinished, myPercentageFinished, publicView));
                if (goalTexts.length == myAchievement.goals.length) {
                    var goalTextsText = "";
                    goalTexts.forEach(function(goalText, index) {
                        goalTextsText += goalText;
                        if (index == goalTexts.length - 1) {
                            achievementDesc += "<div class='achievement-info'><div class='textarea'><h2>"
                                + myAchievement.title
                                + "</h2><p id='achievementDescription'>"
                                + myAchievement.description
                                + "</p></div>"
                                + "<div class='imagearea'><img src='content/img/image-1.png' alt='"
                                +  myAchievement.createdBy + ": " + myAchievement.title
                                + "'/><span class='gradient-bg'> </span><span class='progressbar'> </span><div id='progressbar' class='progress-container'><span class='progress' style='width:"
                                + myPercentageFinished
                                + "%;'></span></div></div><div class='clear'></div>";
                            achievementDesc += goalTextsText;
                            achievementDesc += "<br /><br />";

                            if(!myAchievement.publiclyVisible) {
                                achievementDesc += "<a href='publicize?achievement=" + myAchievement._id + "'>Share publicly</a>";
                            }   else {
                                achievementDesc += "<div class='fb-like' data-send='false' data-width='350' data-show-faces='true' font='segoe ui'></div>";
                            }

                            achievementDesc += "<br /><br />";
                            achievementDesc += "<p>";
                            achievementDesc += "Creator: " + myAchievement.createdBy + "<br />";
                            user.User.findOne({ _id:  currentUserId}, function(err,myUser) {
                                    achievementDesc += "Achiever: " + myUser.username;
                                    achievementDesc += "</p>";
                                    response.write(JSON.stringify(achievementDesc));
                                    response.end('\n', 'utf-8');
                            });



                        }
                    });
                }
            });
        })
    }
}

function getGoalText(goal, achievement, progressNumber, progressPercentage, publicView) {
    var goalText =  '<div id="achievement-container">'
        + '<div class="part-achievement">'
        + '<div class="progress-container">'
        + '<h3>'
        + goal.title
        + '</h3>'
        + '<table border="1px">'
        + '<tr>'
        + '<td class="bararea">'
        + '<span class="progressbar"></span>'
        + '<div id="progressbar-goal"><span class="progress" style="width:'
        + progressPercentage
        + '%;"></span></div>'
        + '</td>'
        + '<td id="countarea" class="countarea">'
        + '<h3>'
        + progressNumber
        + '/'
        + goal.quantityTotal
        + '</h3>'
        + '</td>'
        + '</tr>'
        + '</table>'
        + '</div>';

    if (!publicView && progressPercentage < 100) {
        goalText    += '<div id="addbutton" class="addbutton">'
            + '<a href="javascript:void(0)" onclick="progress(\'' + goal._id + '\', \'' +  goal.quantityTotal + '\')">'
            + '<img src="content/img/+.png" alt="I did it!"/>'
            + '</a>'
            + '</div>';
    }

    goalText    += '<div class="clear"></div>'
        + '</div>'
        + '<div class="separerare-part">&nbsp;</div>'
        + '</div>';

    return goalText;
}

app.get('/progress', function(request, response){
    var goalId  = request.query.goalId;

    progress.markProgress(request.session.user_id, goalId, function(quantityFinished) {
        response.writeHead(200, {'content-type': 'application/json' });
        response.write(JSON.stringify(quantityFinished));
        response.end('\n', 'utf-8');
    });

});

app.get('/publicize', function(request, response){
    var url_parts = url.parse(request.url, true);
    var achievementId  = url_parts.query.achievement;

    achievement.Achievement.findOne({ _id: achievementId }, function(err,currentAchievement) {
        achievement.publicize(currentAchievement);
        response.redirect("/achievement?achievementId="
            + achievementId
            + "&userId="
            + request.session.user_id);
    });
});

app.get('/delete', loadUser, function(request, response){
    achievement.Achievement.findOne({ _id: app.set('current_achievement_id') }, function(err,currentAchievement) {
        if (currentAchievement)    {
            achievement.remove(currentAchievement, request.session.user_id, function () {
                response.writeHead(200, {'content-type': 'application/json' });
                response.write(JSON.stringify('ok'));
                response.end('\n', 'utf-8');
            });
        } else {
            console.log("trying to remove non-existing achievement " + app.set('current_achievement_id'));
        }
    });
});

app.get('/newAchievement', function(request, response){
    user.User.findById(request.session.user_id, function(err, user) {
        var motherAchievement = achievement.createAchievement(user.username, request.query.title, request.query.description);
        var goalToBeCreated = goal.prepareGoal(request.query.goalTitle, request.query.goalQuantity);
        achievement.addGoalToAchievement(goalToBeCreated, motherAchievement, user._id);
        response.writeHead(200, {'content-type': 'application/json' });
        response.write(JSON.stringify('ok'));
        response.end('\n', 'utf-8');
    });
});

function writeLoginPage(response) {
    requestHandlers.indexPage(response);
}

app.get('*', function(request, response){
    response.redirect("/");
});