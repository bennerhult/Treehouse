var mongoose = require('mongoose'),
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
}

var UserSchema = new Schema({
    created         : Date,
    username        : { type: String,  required: true, unique: true, validate: [ /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i, 'invalid_email' ] },
    firstName       : String,
    lastName        : String,
    imageURL        : {type: String, required: true},
    isIssuer        : {type: Boolean, required: false},
    issuerName       : {type: String, required: false}
}, schemaOptions);

var User = mongoose.model('User', UserSchema);

module.exports = {
    User,
    createUser,
    getShortName,
    remove,
    setImageURL,
    setUsernames,
    getPrettyName
}

UserSchema.virtual('prettyName').get(function() {
    if (this.firstName && this.lastName) {
        return this.firstName + " " + this.lastName;
    } else if (this.firstName) {
        return this.firstName;
    } else if (this.lastName) {
        return this.lastName;
    } else  {
        return this.username;
    }
});

function getPrettyName (u) {
    //NOTE: This is a hack
    //u.prettyName should really be all that is needed but some wierdness about mongoose that I cant figure out makes it be undefined in all cases except when logging it so this is the worarkound
    if (u.firstName && u.lastName) {
        return u.firstName + " " + u.lastName;
    } else if (u.firstName) {
        return u.firstName;
    } else if (u.lastName) {
        return u.lastName;
    } else  {
        return u.username;
    }
}

function createUser(name, callback, more) {
    var user = new User();
    user.created = new Date();
    user.username = name;
    user.imageURL = '../content/img/user_has_no_image.jpg';
    user.isIssuer = false;
    if(more) {
        user.firstName = more.firstName
        user.lastName = more.lastName
    }
    user.save(function (error) {
        if (callback) callback(user, error);
    });
};

function setImageURL(userId, imageURL, callback)   {
    User.findById(userId, function(err,myUser) {
        if (myUser) {
            myUser.imageURL = imageURL;

            myUser.save(function (error) {
                if (callback) callback(error);
            });
        }
    });
};

function setUsernames(userId, firstName, lastName, callback)   {
    User.findById(userId, function(err,myUser) {
        if (myUser) {
            myUser.firstName = firstName;
            myUser.lastName = lastName;

            myUser.save(function (error) {
                if (callback) callback(error);
            });
        }
    });
}

function getShortName(userId, callback) {
    User.findById(userId , function(err,myUser) {
        if (myUser){
            if (myUser.firstName) {
                callback(myUser.firstName);
            } else {
                callback(null);
            }
        } else {
            console.log("User not found for userId " + userId + ", error: " + err);
            callback("user not found");
        }
    });
}

function remove(username, next) {
    User.findOne({ username: username }, function(err,userToDelete) {
        if (userToDelete) {
            userToDelete.remove(function () {
                if (next) {
                    next();
                }
            })
        } else {
            next();
        }
    });
}
