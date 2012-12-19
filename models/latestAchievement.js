var mongoose = require('mongoose'),
    treehouse = require('../app.js'),
    Schema= mongoose.Schema

mongoose.connect(treehouse.dburi)

var LatestAchievementSchema = new Schema({
    ownId : {type: Number, required: true},   //singleton, so this is the only one and always = '1'
    id   : {type: Schema.ObjectId, required: true}
})

var LatestAchievement = mongoose.model('LatestAchievement', LatestAchievementSchema)

module.exports = {
    update: update,
    getId: getId
}

function getId(callback) {
    LatestAchievement.findOne({ ownId: 1 }, function(err,latestAchievement) {
        if (latestAchievement) {
            callback(latestAchievement.id)
        } else {
            callback()
        }
    })
}

function update(id) {
    console.log("updating latest ach: " + id )
    LatestAchievement.findOne({ ownId: 1 }, function(err,latestAchievement) {
        if (id == -1) {
            latestAchievement.remove(function (err) {}) //someone unpublicized the last public achievement
        } else if (latestAchievement) {
            latestAchievement.id = id;
            latestAchievement.save(function (error) {})
        } else {
            latestAchievement = new LatestAchievement()    //first time here)
            latestAchievement.ownId = 1
            latestAchievement.id = id
            latestAchievement.save(function (error) {})
        }

    })
}