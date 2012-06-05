var mongoose = require('mongoose'),
    treehouse = require('../app.js'),
    Schema = mongoose.Schema

mongoose.connect(treehouse.dburi)

var LoginTokenSchema = new Schema({
    email       : String,
    series      : String,
    token       : String
})

var LoginToken = mongoose.model('LoginToken', LoginTokenSchema)

module.exports = {
    LoginToken: LoginToken,
    randomToken: randomToken,
    createToken: createToken,
    cookieValue: cookieValue,
    remove: remove
}

function createToken(email, next) {
    var loginToken = new LoginToken()
    loginToken.email = email
    loginToken.token = this.randomToken()
    loginToken.series = this.randomToken()
    loginToken.save(function (error) {
        next(loginToken)
    })

}

function randomToken() {
    return Math.round((new Date().valueOf() * Math.random())) + ''
}

function cookieValue(token) {
    return JSON.stringify({ email: token.email, token: token.token, series: token.series })
}

function remove(email)    {
    LoginToken.find({email: email}, function(err, tokens) {
        tokens.forEach(function(currentToken ) {
            currentToken.remove()
        })
    })
}