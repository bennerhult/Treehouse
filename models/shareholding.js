var mongoose = require('mongoose'),
    achievement = require('./achievement.js'),
    achievementInstance = require('./achievementInstance.js'),
    user = require('./user.js'),
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
    Shareholding,
    createShareholding,
    getSharedAchievementNotifications,
    getCompares,
    acceptShareHolding,
    isAchievementSharedByMe,
    getNrOfChallenges,
    denyShareHolding
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
            achievementInstance.AchievementInstance.findOne({  achievementId: achievement_id, createdBy: sharer_id }, function (err2, motherAchievementInstance) {
                motherAchievementInstance.isShared = true; 
                motherAchievementInstance.save(function () {
                    shareholding.save(function () {
                        callback(true);
                    });
                });
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

function getSharedAchievementNotifications(achieverId, callback) {
    var achievementNotifications = [];
    Shareholding.find({ shareholder_id: achieverId, confirmed: false }, function(err, notifications) {
        if (notifications && notifications.length > 0) {
            notifications.forEach(function(notification, index) {
               achievementInstance.AchievementInstance.findOne({  achievementId: notification.achievement_id, createdBy: notification.sharer_id }, function(err2,currentAchievement) {
                    achievementNotifications.push(currentAchievement);
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
   /* var compares = [];
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
    });*/
}

function denyShareHolding(achievement_id, shareholder_id, sharer_id) {
    Shareholding.findOne({ achievement_id: achievement_id, shareholder_id: shareholder_id, sharer_id: sharer_id, confirmed: false }, function(err, shareholdingInstance) {
        shareholdingInstance.remove();
    });
}

function getNrOfChallenges(user_id, callback) {
    Shareholding.find({ shareholder_id: user_id, confirmed: false }, function(err, challenges) {
        callback(challenges.length);
    });
}

function acceptShareHolding(motherAchievementInstance, currentUser, sharer_id, callback) {
    Shareholding.findOne({ achievement_id: motherAchievementInstance.achievementId, shareholder_id: currentUser._id, sharer_id: sharer_id, confirmed: false }, function(err, shareholdingInstance) {
        if (shareholdingInstance) {
            achievement.Achievement.findById(motherAchievementInstance.achievementId, function (err2, motherAchievement) {
                achievementInstance.createAchievementInstance(motherAchievement, currentUser, function(myAchievementInstance) {
                    myAchievementInstance.isShared = true;
                    myAchievementInstance.save(function () {
                        shareholdingInstance.confirmed = true;
                        shareholdingInstance.save(function () {
                            callback(myAchievementInstance);
                        });
                    });    
                });
            });
        } else {
            callback();
        }
    });
}