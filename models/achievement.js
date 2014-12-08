var mongoose = require('mongoose'),
    goal = require('./goal.js'),
    latestAchievement = require('./latestAchievement.js'),
    newsfeedEvent = require('./newsfeedEvent.js'),
    progress = require('./progress.js'),
    Schema= mongoose.Schema

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
})

var Achievement = mongoose.model('Achievement', AchievementSchema)

module.exports = {
    Achievement: Achievement,
    createAchievement: createAchievement,
    createIssuedAchievement: createIssuedAchievement,
    acceptIssuedAchievement: acceptIssuedAchievement,
    issue: issue,
    userHasAcceptedAchievement: userHasAcceptedAchievement,
    addGoalToAchievement: addGoalToAchievement,
    removeSharedPartOfAchievement: removeSharedPartOfAchievement,
    publicize: publicize,
    unpublicize: unpublicize,
    remove: remove,
    save: save,
    findPublicAchievement: findPublicAchievement
}

function createAchievement(createdBy, title, description, imageURL) {
    var achievement = new Achievement()
    achievement.createdDate = new Date()
    achievement.createdBy = createdBy
    achievement.title = title
    achievement.description = description
    achievement.imageURL = imageURL
    return achievement
}

function createIssuedAchievement(createdBy, title, description, imageURL, issuerName) {
    var achievement = new Achievement()
    achievement.createdDate = new Date()
    achievement.createdBy = createdBy
    achievement.title = title
    achievement.description = description
    achievement.imageURL = imageURL
    achievement.issuedAchievement = true
    achievement.issuerName = issuerName
    return achievement
}

function userHasAcceptedAchievement(achievement_id, achiever_id, callback) {
    progress.Progress.findOne({ achievement_id: achievement_id, achiever_id: achiever_id}, function(err,currentAchievement) {
        if (currentAchievement) {
            callback(true)
        } else {
            callback(false)
        }
    })
}

function acceptIssuedAchievement(achievement_id, achiever_id, callback) {
    Achievement.findOne({ _id: achievement_id }, function(err,currentAchievement) {
        currentAchievement.goals.forEach(function(goal, index) {
            progress.createAndSaveProgress(achiever_id, achievement_id, goal._id)
            if (index == currentAchievement.goals.length -1)  {
                callback(currentAchievement.title)
            }
        })
    })
}

function issue(achievement, callback) {
    achievement.isIssued = true
    achievement.save(function (error) {
        callback(error)
    })
}

function addGoalToAchievement(goal, achievement, userId, callback) {
    achievement.goals.push(goal)
    progress.createProgress(userId, achievement._id, goal._id, callback)
}

function save(achievement, callback) {
    achievement.save(function (error) {
        callback(error, achievement._id)
    })
}

function publicize(oneProgress) {
    progress.Progress.find({ achievement_id: oneProgress.achievement_id, achiever_id: oneProgress.achiever_id }, function(err,progresses) {
        progresses.forEach(function(currentProgress, index) {
            currentProgress.publiclyVisible = true
            currentProgress.save()
            if (index === (progresses.length -1)) {
                newsfeedEvent.addEvent("publicize", oneProgress.achiever_id, oneProgress.achievement_id)
                latestAchievement.update(oneProgress._id)
            }
        })
    })
}

function updateLatestAchievementIfNecessary(progressId, next) {
    latestAchievement.getId(function(latestAchievement_progressId) {
        progress.Progress.findOne({ _id: latestAchievement_progressId }, function(err,currentProgress) {
            if (progressId && currentProgress) {
                if (progressId.equals(currentProgress._id)) {
                    setNewPublicAchievement(next);
                } else {
                    if (next) {
                        next();
                    }
                }
            } else {
                setNewPublicAchievement(next);
            }
        });
    });
}

function setNewPublicAchievement(next) {
    findPublicAchievement(function (publicId) {
        if (publicId) {
            latestAchievement.update(publicId);
        }   else {
            latestAchievement.update(-1);
        }
        if (next) {
            next();
        }
    });
}

function unpublicize(oneProgress) {
    progress.Progress.find({ achievement_id: oneProgress.achievement_id, achiever_id: oneProgress.achiever_id }, function(err,progresses) {
        progresses.forEach(function(currentProgress, index) {
            currentProgress.publiclyVisible = false;
            currentProgress.save();
            if (index == (progresses.length -1)) {
                updateLatestAchievementIfNecessary (oneProgress._id);
            }
        });
    })
}

function remove(achievement, userId, next) {
    progress.Progress.find({ achievement_id: achievement._id}, function(err, progresses) {
        if (progresses && progresses.length > 0) {
            next();
        } else {
            removeSharedPartOfAchievement(achievement, userId, function() {
                achievement.remove(function () {
                    if (next) {
                        next();
                    }
                });
            });
        }
    });
}

function removeSharedPartOfAchievement(achievement, userId, next)    {
    progress.Progress.find({ achiever_id: userId, achievement_id: achievement._id}, function(err, progresses) {
        progresses.forEach(function(currentProgress, index) {
            if (index == (progresses.length - 1)) {
                if (currentProgress) {
                    currentProgress.remove();
                }
                updateLatestAchievementIfNecessary(currentProgress._id, next);
            } else if (currentProgress) {
                currentProgress.remove()
            }
        });
    });
}

function findPublicAchievement(callback) {
    progress.Progress.findOne({ publiclyVisible: true }, function(err,currentProgress) {
        if (currentProgress) {
            callback(currentProgress._id);
        } else {
            callback();
        }
    });
}