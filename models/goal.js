var mongoose = require('mongoose'),
    treehouse = require('../app.js'),
    Schema = mongoose.Schema;

mongoose.connect(treehouse.dburi);

var GoalSchema = new Schema({
    createdDate     : Date,
    title           : String,
    quantityTotal     : Number
});

var Goal = mongoose.model('Goal', GoalSchema);

module.exports = {
    Goal: Goal,
    prepareGoal: prepareGoal,
    GoalSchema: GoalSchema
};

function prepareGoal(title, quantityTotal) {
    var goal = new Goal();
    goal.createdDate = new Date();
    goal.title = title;
    goal.quantityTotal = quantityTotal;
    return goal;
}