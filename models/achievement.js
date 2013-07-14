var mongoose = require('mongoose'),
    treehouse = require('../app.js'),
    goalSchema = require('./goal.js'),
    progress = require('./progress.js'),
    latestAchievement = require('./latestAchievement.js'),
    Schema= mongoose.Schema

mongoose.connect(treehouse.dburi)

var AchievementSchema = new Schema({
    createdDate         : {type: Date, required: true},
    createdBy           : {type: String, required: true},
    title               : {type: String, required: true},
    description         : {type: String},
    imageURL            : {type: String, required: true},
    goals               : {type: [goalSchema], required: true}
})

var Achievement = mongoose.model('Achievement', AchievementSchema)

module.exports = {
    Achievement: Achievement,
    createAchievement: createAchievement,
    clearGoals: clearGoals,
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

function clearGoals(achievement, callback) {
    achievement.goals = []
    callback(achievement);
}

function addGoalToAchievement(goal, achievement, userId, callback) {
    achievement.goals.push(goal)
    progress.createProgress(userId, achievement._id, goal._id, callback)
}

function save(achievement, callback) {
    achievement.save(function (error) {
        callback(error)
    })
}

function publicize(oneProgress) {
    progress.Progress.find({ achievement_id: oneProgress.achievement_id, achiever_id: oneProgress.achiever_id }, function(err,progresses) {
        progresses.forEach(function(currentProgress, index) {
            currentProgress.publiclyVisible = true
            currentProgress.save()
            if (index == (progresses.length -1)) {
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
                    setNewPublicAchievement(next)
                } else {
                    next()
                }
            } else {
                setNewPublicAchievement(next)
            }
        })
    })
}

function setNewPublicAchievement(next) {
    findPublicAchievement(function (publicId) {
        if (publicId) {
            latestAchievement.update(publicId)
        }   else {
            latestAchievement.update(-1)
        }
        if (next) {
            next()
        }
    })
}

function unpublicize(oneProgress) {
    progress.Progress.find({ achievement_id: oneProgress.achievement_id, achiever_id: oneProgress.achiever_id }, function(err,progresses) {
        progresses.forEach(function(currentProgress, index) {
            currentProgress.publiclyVisible = false
            currentProgress.save()
            if (index == (progresses.length -1)) {
                updateLatestAchievementIfNecessary (oneProgress._id)
            }
        })
    })
}

function remove(achievement, userId, next) {
    removeSharedPartOfAchievement(achievement, userId, function() {
        progress.Progress.find({ achievement_id: achievement._id}, function(err, progresses) {
            if (progresses && progresses.length > 0) {
                next()
            }  else {
                achievement.remove(function () {
                    if (next) {
                        next()
                    }
                })
            }
        })
    })
}

function removeSharedPartOfAchievement(achievement, userId, next)    {
    progress.Progress.find({ achiever_id: userId, achievement_id: achievement._id}, function(err, progresses) {
        progresses.forEach(function(currentProgress, index) {
            if (index == (progresses.length - 1)) {
                currentProgress.remove()
                updateLatestAchievementIfNecessary (currentProgress._id, next)
            }
            currentProgress.remove()
        })
    })
}

function findPublicAchievement(callback) {
    progress.Progress.findOne({ publiclyVisible: true }, function(err,currentProgress) {
        if (currentProgress) {
            callback(currentProgress._id)
        } else {
            callback()
        }
    })
}