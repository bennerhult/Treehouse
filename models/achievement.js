var mongoose = require('mongoose'),
    treehouse = require('../app.js'),
    goalSchema = require('./goal.js'),
    progress = require('./progress.js'),
    Schema= mongoose.Schema;

mongoose.connect(treehouse.dburi);

var AchievementSchema = new Schema({
    createdDate         : Date,
    createdBy           : String,
    title               : String,
    description         : String,
    imageURL            : String,
    publiclyVisible     : Boolean,
    goals               :[goalSchema]
});

var Achievement = mongoose.model('Achievement', AchievementSchema);
module.exports = {
    Achievement: Achievement,
    createAchievement: createAchievement,
    addGoalToAchievement: addGoalToAchievement,
    publicize: publicize,
    remove: remove,
    save: save
};

function createAchievement(createdBy, title, description, imageURL) {
    var achievement = new Achievement();
    achievement.createdDate = new Date();
    achievement.createdBy = createdBy;
    achievement.title = title;
    achievement.description = description;
    achievement.imageURL = imageURL;
    achievement.publiclyVisible = false;
    return achievement;
}

function addGoalToAchievement(goal, achievement, userId) {
    achievement.goals.push(goal);
    progress.createProgress(userId, achievement._id, goal._id);

}

function save(achievement) {
    achievement.save(function (err) {
    });
}

function publicize(achievement) {
    achievement.publiclyVisible = true;
    achievement.save(function (err) {
    });
}

function remove(achievement, userId, next)    {
    achievement.remove(function (err) {
        progress.removeProgress(achievement._id, userId, next);
    });
}