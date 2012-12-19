var mongoose = require('mongoose'),
    treehouse = require('../app.js'),
    achievement = require('./achievement.js'),
    progress = require('./progress.js'),
    Schema = mongoose.Schema

mongoose.connect(treehouse.dburi)

var ShareholdingSchema = new Schema({
    created         : {type: Date, required: true},
    sharer_id       : {type: Schema.ObjectId, required: true},
    shareholder_id  : {type: Schema.ObjectId, required: true},
    achievement_id  : {type: Schema.ObjectId, required: true},
    confirmed       : {type: Boolean, required: true}
})

var Shareholding = mongoose.model('Shareholding', ShareholdingSchema)

module.exports = {
    Shareholding: Shareholding,
    createShareholding: createShareholding,
    isShareRequestExisting: isShareRequestExisting,
    getSharedAchievementNotifications: getSharedAchievementNotifications,
    confirmShareHolding: confirmShareHolding,
    isAchievementShared: isAchievementShared,
    isAchievementCreatedByMe: isAchievementCreatedByMe,
    ignoreShareHolding: ignoreShareHolding
}

function createShareholding(sharer_id, shareholder_id, achievement_id, callback) {
    var shareholding = new Shareholding()
    shareholding.created = new Date()
    shareholding.sharer_id = sharer_id
    shareholding.shareholder_id = shareholder_id
    shareholding.achievement_id = achievement_id
    shareholding.confirmed = false
    isShareRequestExisting(sharer_id, shareholder_id, achievement_id, function(requestExists) {
        if (!requestExists) {
            shareholding.save(function () {
                callback(true)
            })
        } else {
            callback(false)
        }
    })
}

function isAchievementCreatedByMe(sharer_id, achievement_id, callback) {
    Shareholding.findOne({ sharer_id: sharer_id, achievement_id: achievement_id }, function(err, exists) {
        if (exists) {
            callback(true)
        } else {
            callback(false)
        }
    })
}

function isShareRequestExisting(sharer_id, shareholder_id, achievement_id, callback) {
    Shareholding.findOne({ sharer_id: sharer_id, shareholder_id: shareholder_id, achievement_id: achievement_id }, function(err, exists) {
        if (exists) {
            callback(true)
        } else {
            callback(false)
        }
    })
}

function isAchievementShared(achievement_id, callback) {
    Shareholding.findOne({  achievement_id: achievement_id }, function(err, exists) {
        console.log("shareholding:: " + exists + ", " + achievement_id)
        if (exists) {
            callback(true)
        } else {
            callback(false)
        }
    })
}

function getSharedAchievementNotifications(achieverId, callback) {
    var achievementNotifications = []
    Shareholding.find({ shareholder_id: achieverId, confirmed: false }, function(err, notifications) {
        if (notifications && notifications.length > 0) {
            notifications.forEach(function(notification, index) {
                achievement.Achievement.findOne({ _id: notification.achievement_id }, function(err2,currentAchievement) {
                    achievementNotifications.push(currentAchievement)
                    index++
                    if (index == notifications.length) {
                        callback(achievementNotifications)
                    }
                })
            })
        } else {
            callback()
        }
    })
}

function ignoreShareHolding(achievement_id, shareholder_id, callback) {
    Shareholding.findOne({ shareholder_id: shareholder_id, achievement_id: achievement_id }, function(err, shareholding) {
        shareholding.remove()
        callback()
    })
}

function confirmShareHolding(achievement_id, shareholder_id, callback){
    Shareholding.findOne({ shareholder_id: shareholder_id, achievement_id: achievement_id }, function(err, shareholding) {
        achievement.Achievement.findOne({ _id: achievement_id }, function(err2,currentAchievement) {
            currentAchievement.goals.forEach(function(goal, index) {
                progress.createAndSaveProgress(shareholder_id, achievement_id, goal._id)
                index++
                if (index == currentAchievement.goals.length)  {
                    shareholding.confirmed = true
                    shareholding.save(function () {
                        callback()
                    })
                }
            })
        })
    })
}