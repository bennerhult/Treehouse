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
    if (newsfeedEventList.length > 0) {
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
                                nrOfNewsFeedsGoneThrough++
                                friendsList.forEach(function(currentFriendship) {
                                    var currentFriendId
                                    if (currentFriendship.friend1_id.equals(newsfeedEvent.userId)) {
                                        currentFriendId = currentFriendship.friend2_id
                                    } else {
                                        currentFriendId = currentFriendship.friend1_id
                                    }
                                    addToNewsfeed(newsfeedEvent, currentProgress, currentAchievement, currentFriendId, function() {
                                        nrOfAppendsMade++
                                        if (nrOfNewsFeedsGoneThrough === newsfeedEventList.length && nrOfAppendsMade === nrOfAppendsToMake)  {
                                            console.log("newsfeed cleared")
                                            process.exit()
                                        }
                                    })
                                })
                            }
                        })
                    })
                })
             } else {
                console.log("unhandled event type encountered: " + newsfeedEvent.eventType)
             }
         })
    } else {
        console.log("newsfeed clear")
        process.exit()
    }
})


function addToNewsfeed(newsfeedEvent, currentProgress, currentAchievement, currentFriendId, callback) {
    shareholding.isAchievementSharedByMe(currentFriendId, currentAchievement._id, function(isAchievmentSharedByFriend) {
        if (currentProgress.publiclyVisible || isAchievmentSharedByFriend) {
            appendJsonToNewsfeed(newsfeedEvent, currentAchievement, currentFriendId, function() {
                newsfeedEvent.remove()
                callback()
             })
        } else {
            newsfeedEvent.remove()
        }
    })
}

function appendJsonToNewsfeed(newsfeedEvent, currentAchievement, currentFriendId, callback) {
    user.getPrettyNameAndImageURL(newsfeedEvent.userId, function(prettyname, imageUrl) {
        var newsJson = '{'
            + '"AchieverName":"' + prettyname +'"'
            + ',"AchieverId":"' + newsfeedEvent.userId + '"'
            + ',"AchievementId":"' + currentAchievement._id + '"'
            + ',"AchievementName":"' + currentAchievement.title + '"'
            + ',"AchievementImageURL":"' + currentAchievement.imageURL + '"'
            + '}'
        newsfeed.updateNewsfeed(currentFriendId, newsfeedEvent.eventType, newsJson, callback)
    })
}