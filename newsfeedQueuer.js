var Agenda          = require('agenda'),
    mongoose        = require('mongoose'),
    achievement     = require('./models/achievement.js'),
    friendship      = require('./models/friendship.js'),
    newsfeed        = require('./models/newsfeed.js'),
    newsfeedEvent   = require('./models/newsfeedEvent.js'),
    progress        = require('./models/progress.js'),
    user            = require('./models/user.js')

//TODO split db_uri to vars
var db_uri = 'mongodb://localhost:27017/test'
mongoose.connect(db_uri)
var agenda = new Agenda({db: { address: db_uri }})

agenda.define('populate newsfeeds', function(job, done) {
    newsfeedEvent.NewsfeedEvent.findOne({}, function(err, newsfeedEvent) {
        if (newsfeedEvent) {
             if (newsfeedEvent.eventType === "progress") {
                 progress.Progress.findById({_id:newsfeedEvent.objectId}, function(err, currentProgress) {
                     achievement.Achievement.findById({_id: currentProgress.achievement_id}, function(err, currentAchievement) {
                         friendship.getFriends(newsfeedEvent.userId, function(friendsList) {
                             if (friendsList.length > 0) {
                                 friendsList.forEach(function(currentFriend) {
                                     addToNewsfeed(newsfeedEvent, currentProgress, currentAchievement, currentFriend, done)
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

function addToNewsfeed(newsfeedEvent, currentProgress, currentAchievement, currentFriend, done) {
    if (currentProgress.publiclyVisible) {        //TODO or achievement is shared
        appendJsonToNewsfeed(newsfeedEvent, currentAchievement, currentFriend, function() {
            newsfeedEvent.remove()
            done()
         })
    } else {
        newsfeedEvent.remove()
        done()
    }
}

function appendJsonToNewsfeed(newsfeedEvent, currentAchievement, currentFriend, callback) {
    //TODO TEST append json to newsfeed
    user.getPrettyNameAndImageURL(newsfeedEvent.userId, function(prettyname, imageUrl) {
        var newsJson = '{'
            + '"EventType":"' + newsfeedEvent.eventType + '"'
            + ',"AchieverName":"' + prettyname +'"'
            + ',"AchieverId":"' + newsfeedEvent.userId + '"'
            + ',"AchievementId":"' + currentAchievement._id + '"'
            + ',"AchievementName":"' + currentAchievement.title + '"'
            + ',"AchievementImageURL":"' + currentAchievement.imageURL + '"'
            + '}'
        console.log("updating newsfeed: " + newsJson)
        newsfeed.updateNewsfeed(currentFriend._id, newsfeedEvent.eventType, newsJson, callback)
    })
    callback()
}

agenda.every('10 seconds', 'populate newsfeeds')

agenda.start()