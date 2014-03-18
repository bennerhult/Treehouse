var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var NewsfeedEventSchema = new Schema({
    createdDate     : Date,
    userId          : {type: Schema.ObjectId, required: true},
    eventType       : {type: String, required: true},
    newsJson        : {type: String, required: true}
})

var NewsfeedEvent = mongoose.model('NewsfeedEvent', NewsfeedEventSchema)

module.exports = {
    NewsfeedEvent: NewsfeedEvent,
    createNewsfeedEvent: createNewsfeedEvent,
    NewsfeedEventSchema: NewsfeedEventSchema
}

function createNewsFeedEvent(userId, eventType, newsJson, callback) {
    var newsfeedEvent = new NewsfeedEvent()
    newsfeedEvent.createdDate = new Date()
    newsfeedEvent.userId = userId
    newsfeedEvent.eventType = eventType
    newsfeedEvent.newsJson = newsJson
    if (callback) {
        callback(newsfeedEvent)
    }
}