var mongoose = require('mongoose');
var Goal = require('./goal.js');
var Schema = mongoose.Schema;

var mongoLocalConf = {
    protocol: "mongodb",
    user: "",
    pass: "",
    name: "test",
    host: "localhost",
    port: 27017
};

mongoose.connect(mongoLocalConf.protocol + '://' + mongoLocalConf.host + ':' + mongoLocalConf.port + '/' + mongoLocalConf.name);

var ProgressSchema = new Schema({
    achiever_id     : Schema.ObjectId,
    goal_id           : Schema.ObjectId,
    quantityFinished  : Number
});

var Progress = mongoose.model('Progress', ProgressSchema);

module.exports = {
    Progress: Progress,
    createProgress : createProgress,
    markProgress : markProgress
};

function markProgress(achiever_id, goal_id) {
    Progress.findOne({ achiever_id: achiever_id,  goal_id: goal_id}, function(err,obj) {
        obj.quantityFinished+=1;
        obj.save(function (err) {
        });
    });
}

function createProgress(achiever_id, goal_id) {
    var progress = new Progress();
    progress.achiever_id = achiever_id;
    progress.goal_id = goal_id;
    progress.quantityFinished = 0;

    progress.save(function (err) {
    });
}