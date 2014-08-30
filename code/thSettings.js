module.exports = (function () {
    var environmentName;

    function init(envName) {
        environmentName = envName;
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
        return environmentName && environmentName.toLowerCase() !== 'production';
    }

    return {
        init : init,
        isDevelopment : isDevelopment,
        isProduction : isProduction
    };
}());
