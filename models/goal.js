var mongoose = require('mongoose'),
    progress = require('./progress.js'),
    Schema = mongoose.Schema;

var schemaOptions = {
    toObject: {
        virtuals: true,
        methods: true
    }
    ,toJSON: {
        virtuals: true,
        methods: true
    }
};

var GoalSchema = new Schema({
    createdDate         : Date,
    title               : {type: String, required: true},
    quantityTotal       : {type: Number, required: true},
    quantityCompleted   : {type: Number, required: true},
    progresses          : {type: [progress.ProgressSchema], required: false}
}, schemaOptions)

var Goal = mongoose.model('Goal', GoalSchema);

module.exports = {
    Goal: Goal,
    prepareGoal: prepareGoal,
    GoalSchema: GoalSchema
}

GoalSchema.virtual('percentageCompleted').get(function() {
        return (100*(this.quantityCompleted/this.quantityTotal));
});

function prepareGoal(title, quantityTotal) {
    var goal = new Goal();
    goal.createdDate = new Date();
    goal.title = title;
    goal.quantityTotal = quantityTotal;
    goal.quantityCompleted = 0;
    return goal;
}