var mongoose = require('mongoose'),
    treehouse = require('../app.js'),
    goalSchema = require('./goal.js'),
    progress = require('./progress.js'),
    Schema= mongoose.Schema;

mongoose.connect(treehouse.dburi);

var AchievementSchema = new Schema({
    createdDate     : Date,
    createdBy       : String,
    title           : String,
    description     : String,
    imageURL        : String,
    goals           :[goalSchema]
});

var Achievement = mongoose.model('Achievement', AchievementSchema);
module.exports = {
    Achievement: Achievement,
    createAchievement: createAchievement,
    addGoalToAchievement: addGoalToAchievement
};

function createAchievement(createdBy, title, description) {
    var achievement = new Achievement();
    achievement.createdDate = new Date();
    achievement.createdBy = createdBy;
    achievement.title = title;
    achievement.description = description;
    achievement.imageURL = "content/img/image-2.png";
    return achievement;
}

function addGoalToAchievement(goal, achievement, userId) {
    achievement.goals.push(goal);
    progress.createProgress(userId, achievement._id, goal._id);
    achievement.save(function (err) {
    });
}