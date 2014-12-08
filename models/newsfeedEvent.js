var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NewsfeedEventSchema = new Schema({
    createdDate     : Date,
    eventType       : {type: String, required: true},
    userId          : {type: Schema.ObjectId, required: true},
    objectId        : {type: Schema.ObjectId, required: true}
});

var NewsfeedEvent = mongoose.model('NewsfeedEvent', NewsfeedEventSchema);

module.exports = {
    NewsfeedEvent: NewsfeedEvent,
    addEvent: addEvent
}

function addEvent(eventType, userId, objectId) {
    var newsfeedEvent = new NewsfeedEvent();
    newsfeedEvent.createdDate = new Date();
    newsfeedEvent.eventType = eventType;
    newsfeedEvent.userId = userId;
    newsfeedEvent.objectId = objectId;
    newsfeedEvent.save();
}