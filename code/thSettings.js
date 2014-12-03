module.exports = (function () {
    'use strict';

    var environmentName;
    var autoSignin; //When this is true the server redirects directly to the signup link instead of emailing it to the user. Has no effect in production even if set.
    var domain;

    function init(options) {
        if(!options) {
            options = {};
        }
        environmentName = options.envName;
        autoSignin = options.autoSignin;
        domain = options.domain;
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

    function isAutoSigninEnabled() {
        explodeIfNotInitialized();
        if(isDevelopment()) {
            return autoSignin && autoSignin === true;
        } else if(isTest()) {
            return true;
        } else {
            return false;
        }
    }

    function getDomain() {
        if(!domain)
            throw 'Domain was not set. Call init before using thSettings!';
        return domain;
    }

    return {
        init : init,
        isDevelopment : isDevelopment,
        isProduction : isProduction,
        isTest : isTest,
        isAutoSigninEnabled : isAutoSigninEnabled,
        getDomain : getDomain
    };
}());
