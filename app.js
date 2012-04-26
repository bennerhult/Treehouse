var fs = require('fs'),
    url = require('url'),
    path = require('path'),
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
    interval: 60000 // expiration check worker run interval in millisec (default: 60000)
});

app.configure(function() {
   app.use(express.bodyParser());
   app.use(express.cookieParser());
   app.use(express.favicon()); //change for app.use(express.favicon('public/favicon.ico) when we have a favicon
   app.use(express.session({ store: mongooseSessionStore, secret: 'jkdWs23321kA3kk3kk3kl1lklk1ajUUUAkd378043!sa3##21!lk4' }));
});

var dburi = app.set('db-uri');

module.exports = {
    dburi: dburi
};

var user = require('./models/user.js'),
    achievement = require('./models/achievement.js'),
    goal = require('./models/goal.js'),
    progress = require('./models/progress.js');

function loadUser(request, response, next) {
    if (request.session.user_id) {
        user.User.findById(request.session.user_id, function(err, user) {
            if (user) {
                next();
            } else {
                writeLoginPage(response, "You have been logged out. Come back inside!");
            }
        });
    } else {
        writeLoginPage(response, "You fell out! Come back inside!");
    }
}

var loginPage;
fs.readFile('content/index.html', function (err, data) {
    if (err) {
        throw err;
    }
    loginPage = data;
});

var signupPage;
fs.readFile('content/signup.html', function (err, data) {
    if (err) {
        throw err;
    }
    signupPage = data;
});

app.post('/login', function(request, response){
    user.User.findOne({ username: request.body.username, password: request.body.password }, function(err,myUser) {
        if (myUser != null) {
            request.session.user_id = myUser._id;
            writeAchievements(request, response);
        } else {
            request.session.destroy();
            writeLoginPage(response, 'Username or password unknown.');
        }
    });
});

app.post('/signup', function(request, response){
    user.createUser(request.body.username, request.body.password, function (myUser,err) {
        if (err) {
            writeSignupPage(response,err);
        } else {
            request.session.user_id = myUser._id;
            writeAchievements(request, response);
        }
    });

});

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Treehouse server started on port ' + port);

app.get('/content/*', function(request, response){
    var filePath = '.' + request.url;
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.png':
            contentType = 'image/png';
            break;
    }

    path.exists(filePath, function(exists) {
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else { //404!
            response.redirect("/");
        }
    });
});

app.get('/', function(request, response){
    writeLoginPage(response, "");
});

app.get('/progress', function(request, response){
    var url_parts = url.parse(request.url, true);
    var achievementId  = url_parts.query.achievement;
    var goalId  = url_parts.query.goal;

    achievement.Achievement.findOne({ _id: achievementId }, function(err,obj) {
        progress.markProgress(request.session.user_id, goalId);
        writeAchievementPage(response, request.session.user_id, achievementId);
    });
});

app.get('/login', function(request, response){
    writeLoginPage(response, "");
});

app.get('/signup', function(request, response){
    writeSignupPage(response, "");
});

app.get('/signout', function(request, response){
    request.session.destroy();
    writeLoginPage(response, "");
});

app.get('/achievements', loadUser, function(request, response){
    writeAchievements(request, response);
});

app.get('/achievement', loadUser, function(request, response){
    var url_parts = url.parse(request.url, true);
    var currentAchievementId = url_parts.query.achievementId;
    writeAchievementPage(response, request.session.user_id, currentAchievementId);
});

app.get('/newAchievement', loadUser, function(request, response){
    writeNewAchievementPage(response);
});

app.get('*', function(request, response){
    response.redirect("/");
});

var achievementsPage;
fs.readFile('content/achievements.html', function (err, data) {
    if (err) {
        throw err;
    }
    achievementsPage = data;
});

var achievementPage1 = "<!DOCTYPE html>"
    + "<html xmlns:fb='http://ogp.me/ns/fb#'>"
    + "<head>"
    + "<title>Treehouse</title>"
    + "<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />"
    + "<meta name='viewport' content='width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no'>"
    + "<link rel='icon' href='/content/favicon.ico' type='image/vnd.microsoft.icon'>"
    + "<link rel='stylesheet' href='content/css/core.css' media='screen, projection, print' />"
    + "<script type='text/javascript' src='content/js/css3-mediaqueries.js'></script>"
    + "<link href='http://fonts.googleapis.com/css?family=Philosopher' rel='stylesheet' type='text/css'>"
    + "<script>";

var achievementPage2;
fs.readFile('content/achievement.html', function (err, data) {
    if (err) {
        throw err;
    }
    achievementPage2 = data;
});

var achievementPage3 = "<br /><br /><br /><fb:like send='false' layout='standard' width='350' show_faces='false' font='segoe ui'></fb:like></div></div></div></div></body></html>";

var newAchievementPage;
fs.readFile('content/newAchievement.html', function (err, data) {
    if (err) {
        throw err;
    }
    newAchievementPage = data;
});

app.post('/newAchievement', function(request, response){
    user.User.findById(request.session.user_id, function(err, user) {
        var motherAchievement = achievement.createAchievement(user.username, request.body.title, request.body.description);
        var goalToBeCreated = goal.prepareGoal(request.body.goalTitle, request.body.goalQuantity);

        achievement.addGoalToAchievement(goalToBeCreated, motherAchievement, user._id);
        writeAchievements(request, response);
    });
});

function writeLoginPage(response, errorMessage) {
    response.write(loginPage.toString().replace("<div id='message'></div>", "<div id='message'>" + errorMessage + "</div>"));
    response.end();
}

function writeSignupPage(response, errorMessage) {
    response.write(signupPage.toString().replace("<div id='message'></div>", "<div id='message'>" + errorMessage + "</div>"));
    response.end();
}

function writeAchievements(request, response) {
    response.write(achievementsPage);
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
                                response.write("<div class='achievement first'>");
                            }  else  {
                                response.write("<div class='achievement'>");
                            }
                            response.write("<div class='container'><a href='achievement?achievementId="
                                + myAchievement._id
                                +"'><img src='content/img/defaultImage.png' alt='"
                                + myAchievement.title
                                + "'/><span class='gradient-bg'> </span><span class='progressbar'> </span><div class='progress-container-achievements'><span class='progress' style='width:"
                                + myPercentageFinished
                                + "%;'> </span></div></a></div><p>"
                                + myAchievement.title
                                + "</p><div class='separerare'>&nbsp;</div></div>");

                            if (index == progresses.length -1) {
                                response.write("<div class='achievement'><div class='container'><a href='newAchievement'><img src='content/img/empty.png' alt=''/></a></div><p>Create new achievement</p><div class='separerare'>&nbsp;</div></div>");
                                finishAchievementsPage(response);
                            }
                        }
                    });

                });
            });
        } else {
            response.write("<div class='achievement first'><div class='container'><a href='newAchievement'><img src='content/img/empty.png' alt=''/></a></div><p>Create new achievement</p><div class='separerare'>&nbsp;</div></div>");
            finishAchievementsPage(response);
        }
    });
}

function finishAchievementsPage(response) {
    response.write("</div></div></div></body></html>");
    response.end();
}

function writeNewAchievementPage(response) {
    response.write(newAchievementPage);
    response.end();
}

function writeAchievementPage(response, currentUserId, currentAchievementId) {
    response.write(achievementPage1);
    response.write("var currentUserId =  '" + currentUserId + "';");
    response.write("var currentAchievementId =  '" + currentAchievementId + "'; </script>");

    response.write("<meta property='og:title' content='I achieved something today!'/>");                                                              //The title of the entity.
    response.write("<meta property='og:type' content='article'/>");                                                                //The type of entity. You must select a type from the list of Open Graph types.
    response.write("<meta property='og:image' content='http://treehouse.io/content/img/image-1.png'/>");                            //The URL to an image that represents the entity. Images must be at least 50 pixels by 50 pixels. Square images work best, but you are allowed to use images up to three times as wide as they are tall.
    response.write("<meta property='og:url' content='www.treehouse.io?achievementId=" + currentAchievementId + "'/>");              //The canonical, permanent URL of the page representing the entity. When you use Open Graph tags, the Like button posts a link to the og:url instead of the URL in the Like button code.
    response.write("<meta property='og:site_name' content='Treehouse'/>");                                                          //A human-readable name for your site, e.g., "IMDb".

    response.write(achievementPage2);
    createAchievementDesc(response, currentUserId, currentAchievementId);
}

function createAchievementDesc (response, currentUserId, currentAchievementId) {
    achievement.Achievement.findById(currentAchievementId, function(err,myAchievement) {
        if (myAchievement) {
            var goalTexts = [];
            myAchievement.goals.forEach(function(goal) {
                progress.Progress.findOne({ achiever_id:  currentUserId,  goal_id: goal._id}, function(err,myProgress) {
                    var myPercentageFinished = (myProgress.quantityFinished / goal.quantityTotal) * 100;
                    goalTexts.push(getGoalText(goal, myAchievement, myProgress.quantityFinished, myPercentageFinished));
                    if (goalTexts.length == myAchievement.goals.length) {
                        var goalTextsText = "";
                        goalTexts.forEach(function(goalText, index) {
                            goalTextsText += goalText;
                            if (index == goalTexts.length - 1) {
                                response.write("<div class='achievement-info'><div class='textarea'><h2>"
                                    + myAchievement.createdBy + ": " + myAchievement.title
                                    + "</h2><p id='achievementDescription'>"
                                    + myAchievement.description
                                    + "</p></div>"
                                    + "<div class='imagearea'><img src='content/img/image-1.png' alt='"
                                    +  myAchievement.createdBy + ": " + myAchievement.title
                                    + "'/><span class='gradient-bg'> </span><span class='progressbar'> </span><div class='progress-container'><span class='progress' style='width:"
                                    + myPercentageFinished
                                    + "%;'> </span></div></div><div class='clear'></div>");
                                response.write(goalTextsText);
                                response.write(achievementPage3);
                                response.end();
                            }
                        });
                    }
                });
            })
        } else {
            response.write(achievementPage3);
            response.end();
        }
    });
}

function getGoalText(goal, achievement, progressNumber, progressPercentage) {
    var goalText =  "<div id='achievement-container'>"
    + "<div class='part-achievement'>"
    + "<div class='progress-container'>"
    + "<h3>"
    +  goal.title
    +"</h3>"
    + "<table border='1px'>"
    + "<tr>"
    + "<td class='bararea'>"
    + "<span class='progressbar'></span>"
    + "<span class='progress' style='width:"
    + progressPercentage
    + "%;'> </span>"
    + "</td>"
    + " <td class='countarea'>"
    + "<h3>"
    + progressNumber
    + "/"
    + goal.quantityTotal
    + "</h3>"
    + "</td>"
    + "</tr>"
    + "</table>"
    + "</div>";


    if (progressPercentage < 100) {
        goalText    += "<div class='addbutton'>"
                    + "<a href='progress?achievement="
                    + achievement._id
                    + "&goal="
                    + goal._id
                    + "'>"
                    + "<img src='content/img/+.png' alt='I did it!'/>"
                    + "</a>"
                    + "</div>";
    }

    goalText    += "<div class='clear'></div>"
    + "</div>"
    + "<div class='separerare-part'>&nbsp;</div>"
    + "</div>";

    return goalText;
}