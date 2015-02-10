var mongoose = require('mongoose'),
    async = require('async'),
    goal = require('./goal.js'),
    newsfeedEvent = require('./newsfeedEvent.js'),
    progress = require('./progress.js'),
    achievementInstance = require('./achievementInstance.js'),
    Schema= mongoose.Schema;

var AchievementSchema = new Schema({
    createdDate         : {type: Date, required: true},
    createdBy           : {type: String, required: true},
    title               : {type: String, required: true},
    description         : {type: String},
    imageURL            : {type: String, required: true},
    issuedAchievement   : {type: Boolean, required: false},
    isIssued            : {type: Boolean, required: false},
    issuerName          : {type: String, required: false},
    goals               : {type: [goal.GoalSchema], required: true}
});

var Achievement = mongoose.model('Achievement', AchievementSchema);

module.exports = {
    Achievement: Achievement,
    createAchievement: createAchievement,
    issue: issue,
    userHasAcceptedAchievement: userHasAcceptedAchievement,
    remove: remove,
    save: save,
}

function createAchievement(createdBy, title, description, imageURL, goals, callback) {
    var myAchievement = new Achievement();
    myAchievement.createdDate = new Date();
    myAchievement.createdBy = createdBy;
    myAchievement.title = title;
    myAchievement.description = description;
    myAchievement.imageURL = imageURL;
    async.each(goals, function(currentGoal, goalProcessed ) {
        var myGoal = goal.prepareGoal(currentGoal.title, currentGoal.quantity);
        myAchievement.goals.push(myGoal);
        goalProcessed();
    }, function() {
        save(myAchievement, function(error) {
            achievementInstance.createAchievementInstance(myAchievement, createdBy, callback)
        });
    });
}

function issue(achievement, callback) {
    achievement.isIssued = true;
    achievement.save(function (error) {
        callback(error);
    });
}

function userHasAcceptedAchievement(achievement_id, achiever_id, callback) {
    progress.Progress.findOne({ achievement_id: achievement_id, achiever_id: achiever_id}, function(err,currentAchievement) {
        if (currentAchievement) {
            callback(true);
        } else {
            callback(false);
        }
    });
}

function acceptIssuedAchievement(achievement_id, achiever_id, callback) {
    Achievement.findOne({ _id: achievement_id }, function(err,currentAchievement) {
        currentAchievement.goals.forEach(function(goal, index) {
            progress.createAndSaveProgress(achiever_id, achievement_id, goal._id);
            if (index == currentAchievement.goals.length -1) {
                callback(currentAchievement.title);
            }
        });
    });
}

function remove(achievementId, userId, next) {
    removeIndividualPartOfAchievement(achievementId, userId, function() {
        progress.Progress.find({ achievement_id: achievementId}, function(err, progresses) {
            if (!(progresses && progresses.length > 0)) {
                Achievement.findOne({ _id: achievementId }, function(err,currentAchievement) {
                    currentAchievement.remove(function () {});
                });
            }
        });
        if (next) {
            next();
        }
    });
}

function save(achievement, callback) {
    achievement.save(function (error) {
        callback(error, achievement._id);
    });
}