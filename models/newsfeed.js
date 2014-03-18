var mongoose = require('mongoose'),
    newsItem = require('./newsItem.js'),
    Schema = mongoose.Schema

var NewsfeedSchema = new Schema({
    created         : {type: Date, required: true},
    latestUpdated   : {type: Date, required: true},
    userId          : {type: Schema.ObjectId, required: true},
    newsItems        : {type: [newsItem.NewsItemSchema], required: true}
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

    newsItem.createNewsItem(newsType, newsText, function(createdNewsItem) {
        newsfeed.latestUpdated = new Date()
        newsfeed.newsItems.push(createdNewsItem)
        newsfeed.save(function () {
            if (callback) {
                callback(newsfeed)
            }
        })
    })
}

function updateNewsfeed(userId, newsType, newsText, callback) {
    Newsfeed.find({ userId: userId}, function(err, newsfeed) {
       if (newsfeed) {
           newsItem.createNewsItem(newsType, newsText, function(createdNewsItem) {
               newsfeed.latestUpdated = new Date()
               newsfeed.newsItems.push(createdNewsItem)
               newsfeed.save(function () {
                   if (callback) {
                       callback(newsfeed)
                   }
               })
           })
       }
    })
}

function getNewsfeed(user_Id, callback) {
    Newsfeed.findOne({ userId: user_Id}, function(err, newsfeed) {
        if (newsfeed) {
            callback(newsfeed)
        } else {
            createNewsfeed(user_Id, "info","Welcome to Treehouse! Get started by adding some friends or create your very own achievements!",  callback)
        }
    })
}