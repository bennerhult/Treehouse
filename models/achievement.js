var mongoose = require('mongoose'),
    db = require('./db.js'),
    GoalSchema = require('./goal.js'),
    Progress = require('./progress.js'),
    Schema= mongoose.Schema;

mongoose.connect(db.uri);

var AchievementSchema = new Schema({
    createdDate     : Date,
    createdBy       : String,
    title           : String,
    description     : String,
    imageURL        : String,
    goals           :[GoalSchema]
});

var Achievement = mongoose.model('Achievement', AchievementSchema);
module.exports = {
    Achievement: Achievement,
    createAchievement: createAchievement,
    addGoalToAchievement: addGoalToAchievement
};

function createAchievement(title, description) {
    var achievement = new Achievement();
    achievement.createdDate = new Date();
    achievement.createdBy = "Erik";
    achievement.title = title;
    achievement.description = description;
    achievement.imageURL = "content/img/image-2.png";
    return achievement;
}

function addGoalToAchievement(goal, achievement, userId) {
    achievement.goals.push(goal);
    Progress.createProgress(userId, goal._id);
    achievement.save(function (err) {
    });
}