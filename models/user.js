var mongoose = require('mongoose')
treehouse = require('../app.js'),
    Schema = mongoose.Schema;

mongoose.connect(treehouse.dburi);

var UserSchema = new Schema({
    created         : Date,
    username        : {type: String, required: true, unique: true},
    password        : {type: String, required: true}
});

var User = mongoose.model('User', UserSchema);

module.exports = {
    User: User,
    createUser: createUser
};

function createUser(name, password, callback) {
    var user = new User();
    user.created = new Date();
    user.username = name;
    user.password = password;
    user.save(function (error) {
        callback(error);
    });
}