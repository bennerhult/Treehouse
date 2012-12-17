var mongoose = require('mongoose'),
    treehouse = require('../app.js'),
    Schema = mongoose.Schema

mongoose.connect(treehouse.dburi)

var ProgressSchema = new Schema({
    achiever_id         : {type: Schema.ObjectId, required: true},
    achievement_id      : {type: Schema.ObjectId, required: true},
    goal_id             : {type: Schema.ObjectId, required: true},
    quantityFinished    :{type: Number, required: true}
})

var Progress = mongoose.model('Progress', ProgressSchema)

module.exports = {
    Progress: Progress,
    createProgress : createProgress,
    createAndSaveProgress : createAndSaveProgress,
    markProgress : markProgress,
    removeProgress : removeProgress
}

function markProgress(achiever_id, goal_id, next) {
    Progress.findOne({ achiever_id: achiever_id,  goal_id: goal_id}, function(err,obj) {
        obj.quantityFinished+=1
        obj.save(function (err) {
            next(obj.quantityFinished)
        })
    })
}

function createProgress(achiever_id, achievement_id, goal_id, callback) {
    var progress = new Progress()
    progress.achiever_id = achiever_id
    progress.achievement_id = achievement_id
    progress.goal_id = goal_id
    progress.quantityFinished = 0
    if (callback) {
        callback (progress);
    }
}

function createAndSaveProgress(achiever_id, achievement_id, goal_id) {
    var progress = new Progress()
    progress.achiever_id = achiever_id
    progress.achievement_id = achievement_id
    progress.goal_id = goal_id
    progress.quantityFinished = 0
    progress.save()
}

function removeProgress(achievement_id, user_id, next) {
    Progress.find({ achiever_id: user_id, achievement_id: achievement_id}, function(err, progresses) {
        progresses.forEach(function(currentProgress, index) {
            currentProgress.remove()
            if (index == progresses.length - 1) {
              next()
            }
        })
    })
}