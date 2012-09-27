var mongoose = require('mongoose'),
    treehouse = require('../app.js'),
    Schema = mongoose.Schema

mongoose.connect(treehouse.dburi)

var FriendshipSchema = new Schema({
    created         : {type: Date, required: true},
    friend1_id      : {type: Schema.ObjectId, required: true},
    friend2_id      : {type: Schema.ObjectId, required: true},
    confirmed       : {type: Boolean, required: true}
})

var Friendship = mongoose.model('Friendship', FriendshipSchema)

module.exports = {
    Friendship: Friendship,
    createFriendship: createFriendship,
    getNrOfRequests: getNrOfRequests
}

function createFriendship(friend1_id, friend2_id, callback) {
    var friendship = new Friendship()
    friendship.created = new Date()
    friendship.friend1_id = friend1_id
    friendship.friend2_id = friend2_id
    friendship.confirmed= false

    friendship.save(function () {
        if (callback) callback(friendship)
    })
}

function getNrOfRequests(user_id, callback) {
    Friendship.find({ friend2_id: user_id }, function(err, friendRequests) {
        callback(friendRequests.length)
    })
}