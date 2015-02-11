var mongoose = require('mongoose'),
    async = require('async'),
    goal = require('./goal.js'),
    newsfeedEvent = require('./newsfeedEvent.js'),
    Schema= mongoose.Schema;


var AchievementInstanceSchema = new Schema({
    createdDate             : {type: Date, required: true},
    createdBy               : {type: String, required: true},
    title                   : {type: String, required: true},
    description             : {type: String},
    imageURL                : {type: String, required: true},
    publiclyVisible         : {type: Boolean, required: true},
    percentageCompleted     : {type: Number, required: true},
    goals                   : {type: [goal.GoalSchema], required: true}
});

var AchievementInstance = mongoose.model('AchievementInstance', AchievementInstanceSchema);

module.exports = {
    AchievementInstance: AchievementInstance,
    createAchievementInstance: createAchievementInstance,
    createIssuedAchievement: createIssuedAchievement,
    acceptIssuedAchievement: acceptIssuedAchievement,
    issue: issue,
    userHasAcceptedAchievement: userHasAcceptedAchievement,
    progress: progress,
    publicize: publicize,
    unpublicize: unpublicize,
    remove: remove,
    findPublicAchievement: findPublicAchievement,
    getAchievementList: getAchievementList
}

function createAchievementInstance(motherAchievement, user, callback) {
    var myAchievementInstance = new AchievementInstance();
    myAchievementInstance.createdDate = new Date();
    myAchievementInstance.createdBy = user;
    myAchievementInstance.title = motherAchievement.title;
    myAchievementInstance.description = motherAchievement.description;
    myAchievementInstance.imageURL = motherAchievement.imageURL;
    myAchievementInstance.publiclyVisible = false;
    myAchievementInstance.percentageCompleted = 0;
    myAchievementInstance.goals = motherAchievement.goals;
    myAchievementInstance.save(function (error) {
        callback();
    });
}

function createIssuedAchievement(createdBy, title, description, imageURL, issuerName) {
    var achievement = new Achievement();
    achievement.createdDate = new Date();
    achievement.createdBy = createdBy;
    achievement.title = title;
    achievement.description = description;
    achievement.imageURL = imageURL;
    achievement.issuedAchievement = true;
    achievement.issuerName = issuerName;
    return achievement;
}

function getAchievementList(userId, callback) {
    AchievementInstance.find({ createdBy: userId}, {}, { sort: { 'created' : -1 } }, function(err, achievementInstances) {
        callback(achievementInstances);
    });
}

function userHasAcceptedAchievement(achievement_id, achiever_id, callback) {
   /* progress.Progress.findOne({ achievement_id: achievement_id, achiever_id: achiever_id}, function(err,currentAchievement) {
        if (currentAchievement) {
            callback(true);
        } else {
            callback(false);
        }
    });*/
}

function acceptIssuedAchievement(achievement_id, achiever_id, callback) {
    /*Achievement.findOne({ _id: achievement_id }, function(err,currentAchievement) {
        currentAchievement.goals.forEach(function(goal, index) {
            progress.createAndSaveProgress(achiever_id, achievement_id, goal._id);
            if (index == currentAchievement.goals.length -1)  {
                callback(currentAchievement.title);
            }
        });
    });*/
}

function issue(achievement, callback) {
    achievement.isIssued = true;
    achievement.save(function (error) {
        callback(error);
    });
}

function progress(goalToUpdate, achievementToUpdate, callback) {
    if  (goalToUpdate.quantityCompleted < goalToUpdate.quantityTotal) {
        var newQuantityCompleted = 0;
        var newQuantityTotal = 0;
        var newGoalCompleted;
        async.each(achievementToUpdate.goals, function(currentGoal, goalProcessed) {
            if (currentGoal._id == goalToUpdate._id) {
                currentGoal.quantityCompleted++;
                newGoalCompleted = currentGoal.quantityCompleted;
            }
            newQuantityCompleted += currentGoal.quantityCompleted;
            newQuantityTotal += currentGoal.quantityTotal;
            goalProcessed();
        }, function(){
            achievementToUpdate.percentageCompleted = 100 * (newQuantityCompleted/newQuantityTotal);
            var id = achievementToUpdate._id;
            delete achievementToUpdate._id;
            AchievementInstance.findByIdAndUpdate(id,  achievementToUpdate, function (err, updatedAchievement) {
                callback(updatedAchievement);
            });
        });
    } else {
        callback(achievementToUpdate);
    }
}

function publicize(oneProgress) {
   /* progress.Progress.find({ achievement_id: oneProgress.achievement_id, achiever_id: oneProgress.achiever_id }, function(err,progresses) {
        progresses.forEach(function(currentProgress, index) {
            currentProgress.publiclyVisible = true;
            currentProgress.save();
            if (index === (progresses.length -1)) {
                newsfeedEvent.addEvent("publicize", oneProgress.achiever_id, oneProgress.achievement_id);
            }
        });
    });*/
}

function unpublicize(oneProgress) {
    /*progress.Progress.find({ achievement_id: oneProgress.achievement_id, achiever_id: oneProgress.achiever_id }, function(err,progresses) {
        progresses.forEach(function(currentProgress, index) {
            currentProgress.publiclyVisible = false;
            currentProgress.save();
            if (index == (progresses.length -1)) {
                newsfeedEvent.addEvent("achievementUnpublicized", oneProgress.achiever_id, oneProgress.achievement_id);
            }
        });
    });*/
}

function remove(achievementId, userId, next) {
   /* removeIndividualPartOfAchievement(achievementId, userId, function() {
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
    });*/
}

/*function removeIndividualPartOfAchievement(achievementId, userId, next)    {
    progress.Progress.find({ achiever_id: userId, achievement_id: achievementId}, function(err, progresses) {
        progresses.forEach(function(currentProgress, index) {
            if (index == (progresses.length - 1)) {
                if (currentProgress) {
                    currentProgress.remove();
                }
                newsfeedEvent.addEvent("achievementRemoved", userId, achievementId);
                next();
            } else if (currentProgress) {
                currentProgress.remove();
            }
        });
    });
}*/

function findPublicAchievement(callback) {
    /*progress.Progress.findOne({ publiclyVisible: true }, function(err,currentProgress) {
        if (currentProgress) {
            callback(currentProgress._id);
        } else {
            callback();
        }
    });*/
}