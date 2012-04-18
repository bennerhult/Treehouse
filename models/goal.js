var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var mongoLocalConf = {
    protocol: "mongodb",
    user: "",
    pass: "",
    name: "test",
    host: "localhost",
    port: 27017
};

mongoose.connect(mongoLocalConf.protocol + '://' + mongoLocalConf.host + ':' + mongoLocalConf.port + '/' + mongoLocalConf.name);


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