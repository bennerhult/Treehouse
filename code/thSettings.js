module.exports = (function () {
    'use strict';

    var environmentName;
    var autoLogin; //When this is true the server redirects directly to the signup link instead of emailing it to the user. Has no effect in production even if set.

    function init(options) {
        if(!options) {
            options = {};
        }
        environmentName = options.envName;
        autoLogin = options.autoLogin;
    }

    function explodeIfNotInitialized() {
        //To prevent accidentaly running as development in production because init was never called
        if(!environmentName)
            throw 'Environment name was not set. Call init before using thSettings!';
    }

    function isProduction() {
        explodeIfNotInitialized();
        return environmentName && environmentName.toLowerCase() === 'production';
    }

    function isDevelopment() {
        explodeIfNotInitialized();
        return environmentName && environmentName.toLowerCase() === 'development';
    }

    function isTest() {
        explodeIfNotInitialized();
        return environmentName && environmentName.toLowerCase() === 'test';
    }

    function isAutoLoginEnabled() {
        explodeIfNotInitialized();
        if(isDevelopment()) {
            return autoLogin && autoLogin === true;
        } else {
            return false;
        }
    }

    return {
        init : init,
        isDevelopment : isDevelopment,
        isProduction : isProduction,
        isTest : isTest,
        isAutoLoginEnabled : isAutoLoginEnabled
    };
}());
