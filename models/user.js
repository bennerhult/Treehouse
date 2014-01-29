var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var UserSchema = new Schema({
    created         : Date,
    username        : { type: String,  required: true, unique: true, validate: [ /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i, 'invalid_email' ] },
    firstName       : String,
    lastName        : String,
    imageURL        : {type: String, required: true},
    isIssuer        : {type: Boolean, required: false},
    issuerName       : {type: String, required: false}
})

var User = mongoose.model('User', UserSchema)

module.exports = {
    User: User,
    createUser: createUser,
    setPrettyName : setPrettyName,
    getShortName: getShortName,
    getPrettyNameAndImageURL : getPrettyNameAndImageURL,
    remove: remove,
    setImageURL : setImageURL
}

function createUser(name, callback) {
    var user = new User()
    user.created = new Date()
    user.username = name
    user.imageURL = 'content/img/user_has_no_image.jpg'
    user.isIssuer = false
    user.save(function (error) {
        if (callback) callback(user, error)
    })
}


function setPrettyName(userId, firstName, lastName, callback)   {
    User.findOne({ _id: userId }, function(err,myUser) {
        if (myUser) {
            myUser.firstName = firstName
            myUser.lastName = lastName

            myUser.save(function (error) {
                if (callback) callback(error)
            })
        }
    })
}

function setImageURL(userId, imageURL, callback)   {
    User.findOne({ _id: userId }, function(err,myUser) {
        if (myUser) {
            myUser.imageURL = imageURL

            myUser.save(function (error) {
                if (callback) callback(error)
            })
        }
    })
}

function getShortName(userId, callback) {
    User.findOne({ _id: userId }, function(err,myUser) {
        if (myUser){
            if (myUser.firstName) {
                callback(myUser.firstName)
            } else {
                callback(null)
            }
        } else {
            console.log("User not found for userId " + userId + ", error: " + err)
            callback("user not found")
        }
    })
}

function remove(username, next) {
    console.log("REMOVING USER: " + username)
    User.findOne({username: username }, function(err,userToDelete) {
        if (userToDelete) {
            userToDelete.remove(function () {
                console.log("USER REMOVED ")
                if (next) {
                    next()
                }
            })
        } else {
            next()
        }
    })
}

function getPrettyNameAndImageURL(userId, callback) {
    User.findOne({ _id: userId }, function(err,myUser) {
        if (myUser){
            if (myUser.firstName && myUser.lastName) {
                callback(myUser.firstName + " " + myUser.lastName, myUser.imageURL)
            } else if (myUser.firstName) {
                callback(myUser.firstName, myUser.imageURL)
            } else if (myUser.lastName) {
                callback(myUser.lastName, myUser.imageURL)
            } else  {
                callback(myUser.username, myUser.imageURL)
            }
        } else {
            console.log("User not found for userId " + userId + ", error: " + err)
            callback("user not found")
        }
    })
}