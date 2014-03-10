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
    console.log("CN1")
    var newsfeed = new Newsfeed()
    newsfeed.created = new Date()
    newsfeed.latestUpdated = new Date()
    newsfeed.userId = userId
    newsfeed.save()
    if (callback) {
        console.log("CN2")
        callback(newsfeed)
    }
}

function updateNewsfeed(userId, news, callback) {
    console.log("UN1")
    Newsfeed.find({ userId: userId}, function(err, newsfeed) {
       if (newsfeed) {
           console.log("UN2")
           newsfeed.latestUpdated = new Date()
           newsfeed.news += news
           newsfeed.save(function () {
               if (callback) {
                   console.log("UN3")
                   callback(newsfeed)
               }
           })
       }
    })
}

function getNewsfeed(user_Id, callback) {
    console.log("GN1: " + user_Id)
    Newsfeed.find({ userId: user_Id}, function(err, newsfeed) {
        console.log("GN2")
        if (newsfeed) {
            console.log("GN3! " + newsfeed)
            callback(newsfeed)
        } else {
            console.log("GN4")
            createNewsfeed(user_Id, callback)
        }
    })
}