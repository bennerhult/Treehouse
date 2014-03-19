var mongoose        = require('mongoose'),
    achievement     = require('./models/achievement.js'),
    friendship      = require('./models/friendship.js'),
    newsfeed        = require('./models/newsfeed.js'),
    newsfeedEvent   = require('./models/newsfeedEvent.js'),
    progress        = require('./models/progress.js'),
    user            = require('./models/user.js')

var db_uri=process.env.DB_URI
mongoose.connect(db_uri)

newsfeedEvent.NewsfeedEvent.findOne({}, function(err, newsfeedEvent) {
    var currentFriendId
    if (newsfeedEvent) {
         if (newsfeedEvent.eventType === "progress") {
             progress.Progress.findById({_id:newsfeedEvent.objectId}, function(err, currentProgress) {
                 achievement.Achievement.findById({_id: currentProgress.achievement_id}, function(err, currentAchievement) {
                     friendship.getFriends(newsfeedEvent.userId, function(friendsList) {
                         if (friendsList.length > 0) {
                             friendsList.forEach(function(currentFriendship) {
                                 if (currentFriendship.friend1_id.equals(newsfeedEvent.userId)) {
                                     currentFriendId = currentFriendship.friend2_id
                                 } else {
                                     currentFriendId = currentFriendship.friend1_id
                                 }
                                 addToNewsfeed(newsfeedEvent, currentProgress, currentAchievement, currentFriendId)
                             })
                         }
                     })
                 })
             })
         } else {
            console.log("unhandled event type encountered: " + newsfeedEvent.eventType)
         }
    } else {
        console.log("newsfeed clear")
        process.exit()
    }
})


function addToNewsfeed(newsfeedEvent, currentProgress, currentAchievement, currentFriendId) {
    if (currentProgress.publiclyVisible) {
        appendJsonToNewsfeed(newsfeedEvent, currentAchievement, currentFriendId, function() {
            newsfeedEvent.remove()
            process.exit()
         })
    } else {
        newsfeedEvent.remove()
        process.exit()
    }

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
    callback()
}