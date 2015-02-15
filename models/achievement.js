var mongoose = require('mongoose'),
    async = require('async'),
    goal = require('./goal.js'),
    newsfeedEvent = require('./newsfeedEvent.js'),
    progress = require('./progress.js'),
    Schema= mongoose.Schema;

var AchievementSchema = new Schema({
    createdDate         : {type: Date, required: true},
    createdBy           : {type: String, required: true},
    title               : {type: String, required: true},
    description         : {type: String},
    imageURL            : {type: String, required: true},
    issuedAchievement   : {type: Boolean, required: false},
    isIssued            : {type: Boolean, required: false},
    issuerName          : {type: String, required: false},
    goals               : {type: [goal.GoalSchema], required: true}
});

var Achievement = mongoose.model('Achievement', AchievementSchema);

module.exports = {
    Achievement: Achievement
}