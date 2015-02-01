var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GoalSchema = new Schema({
    createdDate     : Date,
    title           : {type: String, required: true},
    quantityTotal     : {type: Number, required: true}
})

var Goal = mongoose.model('Goal', GoalSchema);

module.exports = {
    Goal: Goal,
    prepareGoal: prepareGoal,
    GoalSchema: GoalSchema
}

function prepareGoal(title, quantityTotal) {
    var goal = new Goal();
    goal.createdDate = new Date();
    goal.title = title;
    goal.quantityTotal = quantityTotal;
    return goal;
}