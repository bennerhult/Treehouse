var mongoose = require('mongoose'),
    achievement = require('./achievement.js'),
    progress = require('./progress.js'),
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
    isShareRequestExisting: isShareRequestExisting,
    getSharedAchievementNotifications: getSharedAchievementNotifications,
    getCompares: getCompares,
    confirmShareHolding: confirmShareHolding,
    isAchievementShared: isAchievementShared,
    isAchievementCreatedByMe: isAchievementCreatedByMe,
    isAchievementSharedByMe: isAchievementSharedByMe,
    getShareHolders: getShareHolders,
    ignoreShareHolding: ignoreShareHolding
}

function createShareholding(sharer_id, shareholder_id, achievement_id, callback) {
    var shareholding = new Shareholding();
    shareholding.created = new Date();
    shareholding.sharer_id = sharer_id;
    shareholding.shareholder_id = shareholder_id;
    shareholding.achievement_id = achievement_id;
    shareholding.confirmed = false;
    isShareRequestExisting(sharer_id, shareholder_id, achievement_id, function(requestExists) {
        if (!requestExists) {
            shareholding.save(function () {
                callback(true);
            });
        } else {
            callback(false);
        }
    });
}

function isAchievementCreatedByMe(sharer_id, achievement_id, callback) {
    Shareholding.findOne({ sharer_id: sharer_id, achievement_id: achievement_id }, function(err, exists) {
        if (exists) {
            callback(true);
        } else {
            callback(false);
        }
    });
}

function isShareRequestExisting(sharer_id, shareholder_id, achievement_id, callback) {
    Shareholding.findOne({ sharer_id: sharer_id, shareholder_id: shareholder_id, achievement_id: achievement_id }, function(err, exists) {
        if (exists) {
            callback(true);
        } else {
            callback(false);
        }
    });
}

function isAchievementShared(achievement_id, callback) {
    Shareholding.findOne({  achievement_id: achievement_id }, function(err, exists) {
        if (exists) {
            callback(true);
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

function getShareHolders(userId, achievement_id, callback) {
    Shareholding.find({  achievement_id: achievement_id, shareholder_id: userId }, function(err, exists1) {
        Shareholding.find({  achievement_id: achievement_id, sharer_id: userId }, function(err, exists2) {
            if (exists1 || exists2) {
                callback(exists1.concat(exists2));
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
                achievement.Achievement.findOne({ _id: notification.achievement_id }, function(err2,currentAchievement) {
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

function ignoreShareHolding(achievement_id, shareholder_id, callback) {
    Shareholding.findOne({ shareholder_id: shareholder_id, achievement_id: achievement_id }, function(err, shareholding) {
        shareholding.remove();
        callback();
    });
}

function confirmShareHolding(achievement_id, shareholder_id, callback){
    Shareholding.findOne({ shareholder_id: shareholder_id, achievement_id: achievement_id }, function(err, shareholding) {
        achievement.Achievement.findOne({ _id: achievement_id }, function(err2,currentAchievement) {
            currentAchievement.goals.forEach(function(goal, index) {
                progress.createAndSaveProgress(shareholder_id, achievement_id, goal._id);
                if (index == currentAchievement.goals.length -1)  {
                    shareholding.confirmed = true;
                    shareholding.save(function () {
                        callback(currentAchievement.title);
                    });
                }
            });
        });
    });
}