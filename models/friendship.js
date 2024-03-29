var mongoose = require('mongoose'),
    newsfeedEvent = require('./newsfeedEvent.js'),
    Schema = mongoose.Schema;

var FriendshipSchema = new Schema({
    created         : {type: Date, required: true},
    friend1_id      : {type: Schema.ObjectId, required: true},
    friend2_id      : {type: Schema.ObjectId, required: true},
    confirmed       : {type: Boolean, required: true}
});

var Friendship = mongoose.model('Friendship', FriendshipSchema)

module.exports = {
    Friendship,
    createFriendship,
    getNrOfRequests,
    isFriendRequestExisting,
    getPendingRequests,
    removeFriendRequest,
    confirmFriendRequest,
    getFriends,
    unfriendUserById
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
                callback(true, friendship._id)
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
            if (friends1) {
                callback (friends1.concat(friends2))
            } else if (friends2) {
                callback (friends2)
            } else {
                callback()
            }
        })
    })
}

function getNrOfRequests(user_id, callback) {
    Friendship.find({ friend2_id: user_id, confirmed: false }, function(err, friendRequests) {
        callback(friendRequests.length)
    })
}

function isFriendRequestExisting(friend1_id, friend2_id, callback) {
    Friendship.findOne({ friend1_id: friend1_id, friend2_id: friend2_id }, function(err1, requestFirstDirection) {
        Friendship.findOne({ friend1_id: friend2_id, friend2_id: friend1_id }, function(err2, requestSecondDirection) {
           if (requestFirstDirection) {
               callback(true, requestFirstDirection.confirmed, false)
           } else if (requestSecondDirection)   {
               callback(true, requestSecondDirection.confirmed, true)
           } else {
               callback(false, false, false)
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

function unfriendUserById(actualUserId, friendUserId, direction, callback) {
    if(direction == 'incoming') {
        //Decline a friend pending friend request from someone the user doesnt want to be friends with
        Friendship.remove({ friend1_id: friendUserId, friend2_id: actualUserId, confirmed : false }, callback);
    } else if(direction == 'outgoing') {
         //Revoke a pending friend request the user made that has not been accepted yet
        Friendship.remove({ friend1_id: actualUserId, friend2_id: friendUserId, confirmed : false }, callback);
    } else {
        //Revoke any confirmed friendships with the user regardless of who initiated the friendship
        Friendship.remove({ friend1_id: actualUserId, friend2_id: friendUserId, confirmed : true }, function () {
            Friendship.remove({ friend1_id: friendUserId, friend2_id: actualUserId, confirmed : true }, callback);
        });
    }
}

function confirmFriendRequest(friendship_id, callback) {
    Friendship.findOne({ _id: friendship_id}, function(err, friendshipToConfirm) {
        friendshipToConfirm.confirmed = true
        friendshipToConfirm.save(function () {
            newsfeedEvent.addEvent("friends", friendshipToConfirm.friend1_id, friendshipToConfirm.friend2_id)
            callback(friendshipToConfirm.friend1_id)
        })
    })
}