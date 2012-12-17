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
    publiclyVisible     : {type: Boolean, required: true},
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
    achievement.publiclyVisible = false
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

function publicize(achievement) {
    achievement.publiclyVisible = true
    latestAchievement.update(achievement._id)
    achievement.save(function (err) {})   //TODO: handle error
}

function updateLatestAchievementIfNecessary(achievementId) {
    latestAchievement.getId(function(id) {
        if (id) {
            if (id.equals(achievementId)) {
                findPublicAchievement(function (publicId) {
                    if (publicId) {
                        latestAchievement.update(publicId)
                    }   else {
                        latestAchievement.update(-1)
                    }
                })
            }
        }
    })
}

function unpublicize(achievement) {
    achievement.publiclyVisible = false
    achievement.save(function (err) {
        updateLatestAchievementIfNecessary (achievement.id)
    })   //TODO: handle error
}

function remove(achievement, userId, next)    {
    achievement.remove(function (err) {     //TODO: handle error
        updateLatestAchievementIfNecessary (achievement.id)
        progress.removeProgress(achievement._id, userId, next)
    })
}

function removeSharedPartOfAchievement(achievement, userId, next)    {
        updateLatestAchievementIfNecessary (achievement.id)
        progress.removeProgress(achievement._id, userId, next)
}

function findPublicAchievement(callback) {
    Achievement.findOne({ publiclyVisible: true }, function(err,publicAchievement) {
      if (publicAchievement) {
          callback(publicAchievement.id)
      } else {
          callback()
      }
    })
}