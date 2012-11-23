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
    getNrOfRequests: getNrOfRequests,
    isFriendRequestExisting: isFriendRequestExisting,
    getPendingRequests: getPendingRequests,
    removeFriendRequest: removeFriendRequest,
    confirmFriendRequest: confirmFriendRequest,
    getFriends: getFriends
}

function createFriendship(friend1_id, friend2_id, callback) {
    var friendship = new Friendship()
    friendship.created = new Date()
    friendship.friend1_id = friend1_id
    friendship.friend2_id = friend2_id
    friendship.confirmed = false
    isFriendRequestExisting(friend1_id, friend2_id, function(requestExists) {
        if (!requestExists) {
            friendship.save(function () {
                callback(true)
            })
        } else {
           callback(false)
        }
    })
}

function getPendingRequests(user_id, callback) {
    Friendship.find({ friend2_id: user_id, confirmed: false }, function(err, friendRequests) {
        callback(friendRequests)
    })
}

function getFriends(user_id, callback) {
    Friendship.find({ friend2_id: user_id, confirmed: true }, function(err, friends1) {
        Friendship.find({ friend1_id: user_id, confirmed: true }, function(err, friends2) {
            callback (friends1.concat(friends2))
        })
    })
}

function getNrOfRequests(user_id, callback) {
    Friendship.find({ friend2_id: user_id, confirmed: false }, function(err, friendRequests) {
        callback(friendRequests.length)
    })
}

function isFriendRequestExisting(friend1_id, friend2_id, callback2) {
    Friendship.findOne({ friend1_id: friend1_id, friend2_id: friend2_id }, function(err1, requestFirstDirection) {
        Friendship.findOne({ friend1_id: friend2_id, friend2_id: friend1_id }, function(err2, requestSecondDirection) {
           if (requestFirstDirection) {
               callback2(true, requestFirstDirection.confirmed, false)
           } else if (requestSecondDirection)   {
               callback2(true, requestSecondDirection.confirmed, true)
           } else {
               callback2(false, false, false)
           }
        })
    })
}

function removeFriendRequest(friendship_id, next) {
    Friendship.findOne({ _id: friendship_id}, function(err, friendshipToBeRemoved) {
        friendshipToBeRemoved.remove()
        next()
    })
}

function confirmFriendRequest(friendship_id, callback) {
    Friendship.findOne({ _id: friendship_id}, function(err, friendshipToConfirm) {
        friendshipToConfirm.confirmed = true
        friendshipToConfirm.save(function () {
            callback(friendshipToConfirm.friend1_id)
        })
    })
}