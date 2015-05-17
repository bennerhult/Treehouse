var mongoose = require('mongoose'),
    achievement = require('./achievement.js'),
    achievementInstance = require('./achievementInstance.js'),
    Schema = mongoose.Schema;

var ShareholdingSchema = new Schema({
    created         : {type: Date, required: true},
    sharer_id       : {type: Schema.ObjectId, required: true},
    shareholder_id  : {type: Schema.ObjectId, required: true},
    achievement_id  : {type: Schema.ObjectId, required: true},
    confirmed       : {type: Boolean, required: true}
});

var Shareholding = mongoose.model('Shareholding', ShareholdingSchema);

module.exports = {
    Shareholding: Shareholding,
    createShareholding: createShareholding,
    getSharedAchievementNotifications: getSharedAchievementNotifications,
    getCompares: getCompares,
    acceptShareHolding: acceptShareHolding,
    isAchievementSharedByMe: isAchievementSharedByMe,
    acceptShareHolding: acceptShareHolding,
    denyShareHolding: denyShareHolding
}

function createShareholding(sharer_id, shareholder_id, achievement_id, callback) {
    var shareholding = new Shareholding();
    shareholding.created = new Date();
    shareholding.sharer_id = sharer_id;
    shareholding.shareholder_id = shareholder_id;
    shareholding.achievement_id = achievement_id;
    shareholding.confirmed = false;
    Shareholding.findOne({ sharer_id: sharer_id, shareholder_id: shareholder_id, achievement_id: achievement_id }, function(err, exists) {
        if (!exists) {
            shareholding.save(function () {
                callback(true);
            });
        } else {
            callback(false);
        }
    });
}

function isAchievementSharedByMe(userId, achievement_id, callback) {
    Shareholding.findOne({  achievement_id: achievement_id, shareholder_id: userId }, function(err, exists1) {
        Shareholding.findOne({  achievement_id: achievement_id, sharer_id: userId }, function(err, exists2) {
            if (exists1 || exists2) {
                callback(true);
            } else {
                callback(false);
            }
        });
    });
}

function getSharedAchievementNotifications(achieverId, userId, callback) {
    var achievementNotifications = [];
    Shareholding.find({ shareholder_id: achieverId, confirmed: false }, function(err, notifications) {
        if (notifications && notifications.length > 0) {
            notifications.forEach(function(notification, index) {
               achievementInstance.AchievementInstance.findOne({ _id: notification.achievement_id }, function(err2,currentAchievement) {
                   if (notification.shareholder_id == userId || notification.sharer_id == userId) {
                        achievementNotifications.push(currentAchievement);
                    }
                    if (index == (notifications.length -1)) {
                        callback(achievementNotifications);
                    }
                });
            });
        } else {
            callback();
        }
    });
}

function getCompares(achievementId, userId, callback) {
    var compares = [];
    var currentShareFriendId;

    Shareholding.find({ achievement_id: achievementId, confirmed: true }, function(err, shareholdings) {
        if (shareholdings && shareholdings.length > 0) {
            progress.Progress.findOne({ achiever_id: userId, achievement_id: achievementId }, function(err2,ownProgress) {
                if (ownProgress) {
                    compares.push(ownProgress);
                }
            });
            shareholdings.forEach(function(shareholding, index) {
                if (shareholding.shareholder_id == userId) {
                    currentShareFriendId =   shareholding.sharer_id;
                } else {
                    currentShareFriendId =   shareholding.shareholder_id;
                }
                progress.Progress.findOne({ achiever_id: currentShareFriendId, achievement_id: shareholding.achievement_id }, function(err3,currentProgress) {
                    if (currentProgress) {
                        compares.push(currentProgress);
                    }
                    if (index == shareholdings.length -1) {
                        callback(compares);
                    }
                });
            });
        } else {
            callback();
        }
    });
}

function denyShareHolding(achievement_id, shareholder_id, sharer_id) {
    Shareholding.findOne({ achievement_id: achievement_id, shareholder_id: shareholder_id, sharer_id: sharer_id, confirmed: false }, function(err, shareholdingInstance) {
        shareholdingInstance.remove();
    });
}

function acceptShareHolding(motherAchievementInstance, user, sharer_id, callback) {
    Shareholding.findOne({ achievement_id: motherAchievementInstance._id, shareholder_id: user._id, sharer_id: sharer_id, confirmed: false }, function(err, shareholdingInstance) {
        if (shareholdingInstance) {
            achievement.Achievement.findOne({ _id: motherAchievementInstance.achievementId}, function(err2, motherAchievement) {
                 achievementInstance.createAchievementInstance(motherAchievement, user, function(myAchievementInstance) {
                    shareholdingInstance.confirmed = true;
                    shareholdingInstance.save(function () {
                        callback(myAchievementInstance);
                    });
                });
            });
        } else {
            callback();
        }
    });
}