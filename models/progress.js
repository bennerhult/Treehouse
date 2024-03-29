var mongoose = require('mongoose'),
    newsfeedEvent = require('./newsfeedEvent.js'),
    Schema = mongoose.Schema

var ProgressSchema = new Schema({
    created                     : {type: Date, required: true},
    latestUpdated               : {type: Date},
    goal_id                     : {type: Schema.ObjectId, required: true},
    quantityFinished            :{type: Number, required: true}
})

var Progress = mongoose.model('Progress', ProgressSchema)

module.exports = {
    Progress: Progress,
    createProgress : createProgress,
    createAndSaveProgress : createAndSaveProgress
}
/*
function markProgress(achiever_id, goal_id, next) {
    Progress.findOne({ achiever_id: achiever_id,  goal_id: goal_id}, function(err,currentProgress) {
        if (!currentProgress.created) {
            currentProgress.created = new Date()
        }
        currentProgress.latestUpdated = new Date()
        currentProgress.quantityFinished+=1
        currentProgress.save(function (err) {
            newsfeedEvent.addEvent("progress", achiever_id, currentProgress._id)
            next(currentProgress.quantityFinished)
        })
    })
}

function getPercentageFinished(currentAchievement, achiever_id, next) {
    var total = 0
    var finished = 0
    currentAchievement.goals.forEach(function(goal, goalIndex) {
        Progress.findOne({ goal_id: goal._id, achiever_id: achiever_id }, function(err,myProgress) {
            if (err) {
                console.log("error in progress.js: couldn't find progress for user " + achiever_id)
            } else {
                finished += myProgress.quantityFinished
                total += goal.quantityTotal
                if (goalIndex == currentAchievement.goals.length - 1 ) {
                    next((finished/total) * 100)
                }
            }
        })
    })
}
*/
function createProgress(goal_id, callback) {
    var progress = new Progress()
    progress.goal_id = goal_id
    progress.quantityFinished = 0
    progress.created = new Date()
    if (callback) {
        callback (progress);
    }
}

function createAndSaveProgress(goal_id, callback) {
    var progress = new Progress()
    progress.goal_id = goal_id
    progress.quantityFinished = 0
    progress.created = new Date()
    progress.save()
    callback(progress);
}
/*
function removeProgress(achievement_id, user_id, next) {
    Progress.find({ achiever_id: user_id, achievement_id: achievement_id}, function(err, progresses) {
        progresses.forEach(function(currentProgress, index) {
            currentProgress.remove()
            if (index == progresses.length - 1) {
              next()
            }
        })
    })
}*/