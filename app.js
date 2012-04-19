var fs = require('fs'),
    url = require('url'),
    path = require('path'),
    express = require('express'),
    dnode = require('dnode'),
    db = require('./models/db.js'),
    User = require('./models/user.js'),
    achievement = require('./models/achievement.js'),
    goal = require('./models/goal.js'),
    SessionMongoose = require("session-mongoose"),
    progress = require('./models/progress.js');

app = express.createServer();

var mongooseSessionStore = new SessionMongoose({
    url: db.uri,
    interval: 60000 // expiration check worker run interval in millisec (default: 60000)
});

app.configure(function() {
   app.use(express.bodyParser());
   app.use(express.cookieParser());
   app.use(express.favicon()); //change for app.use(express.favicon('public/favicon.ico) when we have a favicon
   app.use(express.session({ store: mongooseSessionStore, secret: 'jkdWs23321kA3kk3kk3kl1lklk1ajUUUAkd378043!sa3##21!lk4' }));
});

function loadUser(request, response, next) {
    if (request.session.user_id) {
        User.User.findById(request.session.user_id, function(err, user) {
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
    User.User.findOne({ username: request.body.username, password: request.body.password }, function(err,myUser) {
        if (myUser != null) {
            request.session.user_id = myUser._id;
            writeAchievements(response);
        } else {
            request.session.destroy();
            writeLoginPage(response, 'Username or password unknown.');
        }
    });
});

app.post('/signup', function(request, response){
    User.createUser(request.body.username, request.body.password, function (err) {
        if (err) {
            writeSignupPage(response,err);
        } else writeLoginPage(response, 'Awesome');
    });

});

var port = process.env.PORT || 3000;
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
        else {
            //404!
            writeLoginPage(response, "Hey, use the rope ladder!");
        }
    });
});

app.listen(port);

app.get('/', function(request, response){
    writeLoginPage(response, "");
});

app.get('/login', function(request, response){
    writeLoginPage(response, "");
});

app.get('/signup', function(request, response){
    writeSignupPage(response, "");
});

app.get('/signout', function(request, response){
    request.session.destroy();
    writeLoginPage(response, "You are logged out!");
});

app.get('/achievements', loadUser, function(request, response){
    writeAchievements(response, "");
});

var currentAchievementCreatedBy = "";
var currentAchievementTitle = "";
app.get('/achievement', loadUser, function(request, response){
    var url_parts = url.parse(request.url, true);
    currentAchievementCreatedBy = url_parts.query.createdBy;
    currentAchievementTitle = url_parts.query.title;
    writeAchievementPage(response, request.session.user_id);
});

app.get('/newAchievement', loadUser, function(request, response){
    writeNewAchievementPage(response, "");
});
var achievementsPage;
fs.readFile('content/achievements.html', function (err, data) {
    if (err) {
        throw err;
    }
    achievementsPage = data;
});

var achievementPage1 = "<!DOCTYPE html>"
    + "<html>"
    + "<head>"
    + "<title>Achievement</title>"
    + "<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />"
    + "<meta name='viewport' content='width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no'>"
    + "<link rel='stylesheet' href='content/css/core.css' media='screen, projection, print' />"
    + "<script type='text/javascript' src='content/js/css3-mediaqueries.js'></script>"
    + "<link href='http://fonts.googleapis.com/css?family=Philosopher' rel='stylesheet' type='text/css'>"
    + "<link href='http://fonts.googleapis.com/css?family=Princess+Sofia' rel='stylesheet' type='text/css'>"
    + "<script>";

var achievementPage2;
fs.readFile('content/achievement.html', function (err, data) {
    if (err) {
        throw err;
    }
    achievementPage2 = data;
});

var newAchievementPage;
fs.readFile('content/newAchievement.html', function (err, data) {
    if (err) {
        throw err;
    }
    newAchievementPage = data;
});

app.post('/newAchievement', function(request, response){
    var motherAchievement = achievement.createAchievement(request.body.title, request.body.description);
    var motherGoal = goal.prepareGoal(request.body.goalTitle, request.body.goalQuantity);
    achievement.addGoalToAchievement(motherGoal, motherAchievement, request.session.user_id);
    writeAchievements(response);
});

function writeLoginPage(response, errorMessage) {
    loginPage = loginPage.toString().replace("<div id='message'></div>", "<div id='message'>" + errorMessage + "</div>");
    response.write(loginPage);
    response.end();
}

function writeSignupPage(response, errorMessage) {
    signupPage = signupPage.toString().replace("<div id='message'></div>", "<div id='message'>" + errorMessage + "</div>");
    response.write(signupPage);
    response.end();
}

function writeAchievements(response) {
    response.write(achievementsPage);
    response.end();
}

function writeNewAchievementPage(response, userId) {
    response.write(newAchievementPage);
    response.end();
}

function writeAchievementPage(response, currentUserId) {
    response.write(achievementPage1);
    response.write("var currentUserId =  '" + currentUserId + "'; </script>");
    response.write(achievementPage2);
    response.end();
}

dnode(function (client) {
    this.createText = function (callback) {
        achievement.Achievement.find({}, function(err, achievements) {
            achievements.forEach(function(achievement, index, array) {
                client.addText(printAchievement (achievement.createdBy, achievement.title));
            });
        });
        client.addText(createAchievementText);
    };
    this.createAchievementDesc = function (currentUserId, callback) {
        setAchievementDesc(client, currentUserId);
    };
}).listen(app);

function setAchievementDesc (client, currentUserId) {
    achievement.Achievement.findOne({ createdBy: currentAchievementCreatedBy, title: currentAchievementTitle }, function(err,myAchievement) {
        var goalTexts = [];
        myAchievement.goals.forEach(function(goal, index, array) {
            progress.Progress.findOne({ achiever_id:  currentUserId,  goal_id: goal._id}, function(err,myProgress) {
                 myPercentageFinished = (myProgress.quantityFinished / goal.quantityTotal) * 100;
                goalTexts.push(getGoalText(goal, myAchievement, myProgress.quantityFinished, myPercentageFinished));
                if (goalTexts.length == myAchievement.goals.length) {
                    goalTextsText = "";
                    var i = 0;
                    goalTexts.forEach(function(goalText, index, array) {
                        goalTextsText += goalText;
                        i++;
                        if (i == myAchievement.goals.length) {
                            client.addAchievementDesc(getAchievementDescriptionTopText(myAchievement, myPercentageFinished)+ goalTextsText);
                        }
                    });
                }
            });
        })
    });
}

function getAchievementDescriptionTopText(myAchievement, myPercentageFinished) {
    return "<div class='achievement-info'><div class='textarea'><h2>"
    + myAchievement.createdBy + ": " + myAchievement.title
    + "</h2><p id='achievementDescription'>"
    + myAchievement.description
    + "</p></div><div class='imagearea'><img src='content/img/image-1.png' alt='"
    +  myAchievement.createdBy + ": " + myAchievement.title
    + "'/><span class='gradient-bg'> </span><span class='progressbar'> </span><span class='progress' style='width:"
    + myPercentageFinished
    + "%;'> </span></div><div class='clear'></div></div>";
}

function getGoalText(goal, achievement, progressNumber, progressPercentage) {
    return "<div id='achievement-container'>"
    + "<div class='part-achievement'>"
    + "<div class='progress-container'>"
    + "<h3>"
    +  goal.title
    +"</h3>"
    + "<table border='1px'>"
    + "<tr>"
    + "<td class='bararea'>"
    + "<span class='progressbar'></span>"
    + " <span class='progress' style='width:"
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
    + "</div>"
    + "<div class='addbutton'>"
    + "<a href='progress?achievement="
    + achievement._id
    + "&goal="
    + goal._id
    + "'>"
    + "<img src='content/img/+.png' alt='I did it!'/>"
    + "</a>"
    + "</div>"
    + "<div class='clear'></div>"
    + "</div>"
    + "<div class='separerare-part'>&nbsp;</div>"
    + "</div>"
}

app.get('/progress', function(request, response){
    var url_parts = url.parse(request.url, true);
    var achievementId  = url_parts.query.achievement;
    var goalId  = url_parts.query.goal;

   achievement.Achievement.findOne({ _id: achievementId }, function(err,obj) {
       progress.markProgress(request.session.user_id, goalId);
       writeAchievementPage(response, request.session.user_id);
    });
});

function printAchievement (createdBy, title) {
    return "<div class='achievement'><div class='container'><a href='achievement?createdBy="
        + createdBy + "&title=" + title
        +"'><img src='content/img/image-2.png' alt='"
        + title
        + "'/><span class='gradient-bg'> </span><span class='progressbar'> </span><span class='progress' style='width:50%;'> </span></a></div><p>"
        + title
        + "</p><div class='separerare'>&nbsp;</div></div>";
}

var createAchievementText = "<div class='achievement first'><div class='container'><a href='newAchievement'><img src='content/img/empty.png' alt=''/></a></div><p>Create a new achievement</p><div class='separerare'>&nbsp;</div></div>";