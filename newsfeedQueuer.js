var mongoose        = require('mongoose'),
    achievement     = require('./models/achievement.js'),
    friendship      = require('./models/friendship.js'),
    newsfeed        = require('./models/newsfeed.js'),
    newsfeedEvent   = require('./models/newsfeedEvent.js'),
    progress        = require('./models/progress.js'),
    shareholding    = require('./models/shareholding.js'),
    user            = require('./models/user.js')

var db_uri=process.env.DB_URI
mongoose.connect(db_uri)

newsfeedEvent.NewsfeedEvent.find({}, function(err, newsfeedEventList) {
    if (newsfeedEventList && newsfeedEventList.length > 0) {
        var nrOfAppendsMade = 0
        var nrOfAppendsToMake = 0
        var nrOfNewsFeedsGoneThrough = 0
        newsfeedEventList.forEach(function(newsfeedEvent) {
            if (newsfeedEvent.eventType === "progress") {
                progress.Progress.findById(newsfeedEvent.objectId, function(err, currentProgress) {
                    achievement.Achievement.findById(currentProgress.achievement_id, function(err, currentAchievement) {
                        friendship.getFriends(newsfeedEvent.userId, function(friendsList) {
                            if (friendsList.length > 0) {
                                nrOfAppendsToMake += friendsList.length
                                nrOfNewsFeedsGoneThrough++;
                                friendsList.forEach(function(currentFriendship) {
                                    var currentFriendId;
                                    if (currentFriendship.friend1_id.equals(newsfeedEvent.userId)) {
                                        currentFriendId = currentFriendship.friend2_id;
                                    } else {
                                        currentFriendId = currentFriendship.friend1_id;
                                    }
                                    addProgressEvent(newsfeedEvent, currentProgress, currentAchievement, currentFriendId, function() {
                                        nrOfAppendsMade++;
                                        if (nrOfNewsFeedsGoneThrough === newsfeedEventList.length && nrOfAppendsMade === nrOfAppendsToMake) {
                                            console.log("newsfeed cleared");
                                            process.exit();
                                        }
                                    });
                                });
                            }
                        });
                    });
                });
            } else if (newsfeedEvent.eventType === "achievementRemoved") {
                console.log("type achievementRemoved found")
                friendship.getFriends(newsfeedEvent.userId, function(friendsList) {
                    var nrOFFriendsGoneThrough = 0;
                    if (friendsList.length > 0) {
                        nrOfAppendsToMake += friendsList.length;
                        nrOfNewsFeedsGoneThrough++;
                        friendsList.forEach(function(currentFriendship) {
                            var currentFriendId;
                            if (currentFriendship.friend1_id.equals(newsfeedEvent.userId)) {
                                currentFriendId = currentFriendship.friend2_id;
                            } else {
                                currentFriendId = currentFriendship.friend1_id;
                            }
                            newsfeed.removeFromNewsfeed(currentFriendId, newsfeedEvent.objectId, function() {
                                nrOfAppendsMade++;
                                nrOFFriendsGoneThrough++;
                                if (nrOFFriendsGoneThrough === friendsList.length) {
                                    newsfeedEvent.remove();
                                }
                                if (nrOfNewsFeedsGoneThrough === newsfeedEventList.length && nrOfAppendsMade === nrOfAppendsToMake)  {
                                    console.log("newsfeed cleared");
                                    process.exit();
                                }
                            });
                        });
                    } else {
                        nrOfNewsFeedsGoneThrough++;
                        console.log("No friends found for user " + newsfeedEvent.userId + " and achievement " + newsfeedEvent.objectId);
                        newsfeedEvent.remove();
                        if (nrOfNewsFeedsGoneThrough === newsfeedEventList.length && nrOfAppendsMade === nrOfAppendsToMake)  {
                            console.log("newsfeed cleared");
                            process.exit();
                        }
                    }
                });
            } else if (newsfeedEvent.eventType === "publicize") {
                achievement.Achievement.findById(newsfeedEvent.objectId, function(err, currentAchievement) {
                    friendship.getFriends(newsfeedEvent.userId, function(friendsList) {
                        if (friendsList.length > 0) {
                            nrOfAppendsToMake += friendsList.length;
                            nrOfNewsFeedsGoneThrough++;
                            friendsList.forEach(function(currentFriendship) {
                                var currentFriendId;
                                if (currentFriendship.friend1_id.equals(newsfeedEvent.userId)) {
                                    currentFriendId = currentFriendship.friend2_id;
                                } else {
                                    currentFriendId = currentFriendship.friend1_id;
                                }
                                addPublicationEvent(newsfeedEvent, currentAchievement, currentFriendId, function() {
                                    nrOfAppendsMade++;
                                    if (nrOfNewsFeedsGoneThrough === newsfeedEventList.length && nrOfAppendsMade === nrOfAppendsToMake)  {
                                        console.log("newsfeed cleared");
                                        process.exit();
                                    }
                                });
                            });
                        }
                    });
                });
            } else if (newsfeedEvent.eventType === "friends") {
                friendship.getFriends(newsfeedEvent.userId, function(friendsList) {
                    if (friendsList.length > 0) {
                        nrOfAppendsToMake += friendsList.length;
                        nrOfNewsFeedsGoneThrough++;
                        friendsList.forEach(function(currentFriendship) {
                            var currentFriendId;
                            if (currentFriendship.friend1_id.equals(newsfeedEvent.userId)) {
                                currentFriendId = currentFriendship.friend2_id;
                            } else {
                                currentFriendId = currentFriendship.friend1_id;
                            }
                            addNewFriendEvent(newsfeedEvent, newsfeedEvent.objectId, currentFriendId, function() {
                                nrOfAppendsMade++;
                                if (nrOfNewsFeedsGoneThrough === newsfeedEventList.length && nrOfAppendsMade === nrOfAppendsToMake)  {
                                    console.log("newsfeed cleared");
                                    process.exit();
                                }
                            });
                        });
                    }
                });
            } else {
                console.log("unhandled event type encountered: " + newsfeedEvent.eventType);
            }
        });
    } else {
        console.log("newsfeed clear");
        process.exit();
    }
});

function addProgressEvent(newsfeedEvent, currentProgress, currentAchievement, currentFriendId, callback) {
    shareholding.isAchievementSharedByMe(currentFriendId, currentAchievement._id, function(isAchievmentSharedByFriend) {
        if (currentProgress.publiclyVisible || isAchievmentSharedByFriend) {
            appendJsonToNewsfeed(newsfeedEvent, currentAchievement, currentFriendId, function() {
                newsfeedEvent.remove();
                callback();
            });
        } else {
            newsfeedEvent.remove();
        }
    })
}

function addPublicationEvent(newsfeedEvent, currentAchievement, currentFriendId, callback) {
    appendJsonToNewsfeed(newsfeedEvent, currentAchievement, currentFriendId, function() {
        newsfeedEvent.remove();
        callback();
    });
}

function addNewFriendEvent(newsfeedEvent, newFriendId, currentFriendId, callback) {
    appendFriendJsonToNewsfeed(newsfeedEvent, newFriendId, currentFriendId, function() {
        newsfeedEvent.remove();
        callback();
    })
}

function appendFriendJsonToNewsfeed(newsfeedEvent, newFriendId, currentFriendId, callback) {
    user.getPrettyNameAndImageURL(newsfeedEvent.userId, function(prettyName) {
        user.getPrettyNameAndImageURL(newFriendId, function(friendName, friendImageUrl) {
            var newsJson = '{'
                + '"AchieverName":"' + prettyName +'"'
                + ',"AchieverId":"' + newsfeedEvent.userId + '"'
                + ',"FriendName":"' + friendName + '"'
                + ',"FriendId":"' + newsfeedEvent.userId + '"'
                + ',"FriendImageURL":"' + friendImageUrl + '"'
                + '}';
            newsfeed.updateNewsfeed(currentFriendId, newsfeedEvent.eventType, newsJson, callback);
        });
    });
}

function appendJsonToNewsfeed(newsfeedEvent, currentAchievement, currentFriendId, callback) {
    user.getPrettyNameAndImageURL(newsfeedEvent.userId, function(prettyName) {
        var newsJson = '{'
            + '"AchieverName":"' + prettyName +'"'
            + ',"AchieverId":"' + newsfeedEvent.userId + '"'
            + ',"AchievementId":"' + currentAchievement._id + '"'
            + ',"AchievementName":"' + currentAchievement.title + '"'
            + ',"AchievementImageURL":"' + currentAchievement.imageURL + '"'
            + '}';
        newsfeed.updateNewsfeed(currentFriendId, newsfeedEvent.eventType, newsJson, callback);
    });
}