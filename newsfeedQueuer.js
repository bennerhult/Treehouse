var Agenda          = require('agenda'),
    mongoose        = require('mongoose'),
    achievement     = require('./models/achievement.js'),
    friendship      = require('./models/friendship.js'),
    newsfeed        = require('./models/newsfeed.js'),
    newsfeedEvent   = require('./models/newsfeedEvent.js'),
    progress        = require('./models/progress.js'),
    user            = require('./models/user.js')

var db_uri=process.env.DB_URI
mongoose.connect(db_uri)
var agenda = new Agenda({db: { address: db_uri }})

agenda.define('populate newsfeeds', function(job, done) {
    newsfeedEvent.NewsfeedEvent.findOne({}, function(err, newsfeedEvent) {
        var currentFriendId
        if (newsfeedEvent) {
             if (newsfeedEvent.eventType === "progress") {
                 progress.Progress.findById({_id:newsfeedEvent.objectId}, function(err, currentProgress) {
                     achievement.Achievement.findById({_id: currentProgress.achievement_id}, function(err, currentAchievement) {
                         friendship.getFriends(newsfeedEvent.userId, function(friendsList) {
                             if (friendsList.length > 0) {
                                 friendsList.forEach(function(currentFriendship) {
                                     if (currentFriendship.friend1_id === newsfeedEvent.userId) {
                                         currentFriendId = currentFriendship.friend2_id
                                     } else {
                                         currentFriendId = currentFriendship.friend1_id
                                     }
                                     addToNewsfeed(newsfeedEvent, currentProgress, currentAchievement, currentFriendId, done)
                                 })
                             }
                         })
                     })
                 })
             } else {
                 done()
             }
        } else {
            console.log("newsfeed clear!")
            done()
        }
    })
})

function addToNewsfeed(newsfeedEvent, currentProgress, currentAchievement, currentFriendId, done) {
    if (currentProgress.publiclyVisible) {
        appendJsonToNewsfeed(newsfeedEvent, currentAchievement, currentFriendId, function() {
            newsfeedEvent.remove()
            done()
         })
    } else {
        newsfeedEvent.remove()
        done()
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

agenda.every('10 seconds', 'populate newsfeeds')

agenda.start()