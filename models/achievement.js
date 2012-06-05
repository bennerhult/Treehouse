var mongoose = require('mongoose'),
    treehouse = require('../app.js'),
    goalSchema = require('./goal.js'),
    progress = require('./progress.js'),
    Schema= mongoose.Schema

mongoose.connect(treehouse.dburi)

var AchievementSchema = new Schema({
    createdDate         : {type: Date, required: true},
    createdBy           : {type: String, required: true},
    title               : {type: String, required: true},
    description         : String,
    imageURL            : {type: String, required: true},
    publiclyVisible     : {type: Boolean, required: true},
    goals               : {type: [goalSchema], required: true}
})

var Achievement = mongoose.model('Achievement', AchievementSchema)

module.exports = {
    Achievement: Achievement,
    createAchievement: createAchievement,
    addGoalToAchievement: addGoalToAchievement,
    publicize: publicize,
    remove: remove,
    save: save
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
    achievement.save(function (err) {})   //TODO: handle error
}

function remove(achievement, userId, next)    {
    achievement.remove(function (err) {
        progress.removeProgress(achievement._id, userId, next)
    })
}