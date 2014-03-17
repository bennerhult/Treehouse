var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var NewsFeedSchema = new Schema({
    created         : {type: Date, required: true},
    latestUpdated   : {type: Date, required: true},
    userId          : {type: Schema.ObjectId, required: true},
    news            : {type: String}
})

var Newsfeed = mongoose.model('Newsfeed', NewsFeedSchema)

module.exports = {
    Newsfeed: Newsfeed,
    createNewsfeed: createNewsfeed,
    updateNewsfeed: updateNewsfeed,
    getNewsfeed: getNewsfeed
}

function createNewsfeed(userId, callback) {
    var newsfeed = new Newsfeed()
    newsfeed.created = new Date()
    newsfeed.latestUpdated = new Date()
    newsfeed.userId = userId
    newsfeed.save()
    if (callback) {
        callback(newsfeed)
    }
}

function updateNewsfeed(userId, news, callback) {
    Newsfeed.find({ userId: userId}, function(err, newsfeed) {
       if (newsfeed) {
           newsfeed.latestUpdated = new Date()
           newsfeed.news += news
           newsfeed.save(function () {
               if (callback) {
                   callback(newsfeed)
               }
           })
       }
    })
}

function getNewsfeed(user_Id, callback) {
    Newsfeed.findOne({ userId: user_Id}, function(err, newsfeed) {
        if (newsfeed) {
            callback(newsfeed)
        } else {
            createNewsfeed(user_Id, callback)
        }
    })
}