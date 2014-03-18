var mongoose = require('mongoose'),
    newsItem = require('./newsItem.js'),
    Schema = mongoose.Schema

var NewsfeedSchema = new Schema({
    created         : {type: Date, required: true},
    latestUpdated   : {type: Date, required: true},
    userId          : {type: Schema.ObjectId, required: true},
    newsItems       : {type: [newsItem.NewsItemSchema], required: true}
})

var Newsfeed = mongoose.model('Newsfeed', NewsfeedSchema)

module.exports = {
    Newsfeed: Newsfeed,
    createNewsfeed: createNewsfeed,
    updateNewsfeed: updateNewsfeed,
    getNewsfeed: getNewsfeed
}

function createNewsfeed(userId, newsType, newsText, callback) {
    var newsfeed = new Newsfeed()
    newsfeed.created = new Date()
    newsfeed.userId = userId
    finalizeNewsFeed(newsfeed, newsType, newsText, callback)
}

function updateNewsfeed(userId, newsType, newsText, callback) {
    Newsfeed.findOne({ userId: userId}, function(err, currentNewsfeed) {
       if (currentNewsfeed) {
            finalizeNewsFeed(currentNewsfeed, newsType, newsText, callback)
       }
    })
}

function finalizeNewsFeed(currentNewsfeed, newsType, newsText, callback) {
    newsItem.createNewsItem(newsType, newsText, function(createdNewsItem) {
        currentNewsfeed.latestUpdated = new Date()
        currentNewsfeed.newsItems.unshift(createdNewsItem)
        currentNewsfeed.save(function () {
            if (callback) {
                callback(currentNewsfeed)
            }
        })
    })
}
function getNewsfeed(user_Id, callback) {
    Newsfeed.findOne({ userId: user_Id}, function(err, currentNewsfeed) {
        if (currentNewsfeed) {
            callback(currentNewsfeed)
        } else {
            createNewsfeed(user_Id, "info","Welcome to Treehouse! Get started by adding some friends or create your very own achievements!",  callback)
        }
    })
}