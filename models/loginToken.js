var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var LoginTokenSchema = new Schema({
    email       : {type: String},
    series      : {type: String},
    token       : {type: String}
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

function remove(email, callback)    {
    var tokensRemoved  = 0
    LoginToken.find({email: email}, function(err, tokens) {
        if (tokens) {
            tokens.forEach(function(currentToken ) {
                currentToken.remove()
                tokensRemoved++
                if (tokensRemoved === tokens.length) {
                    callback()
                }
            })
        } else {
            callback()
        }
    })
}