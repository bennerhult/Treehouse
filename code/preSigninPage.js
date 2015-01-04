module.exports = function (app, templates) {
    'use strict';

    function registerHandlers() {
        app.get('/preSignin', function (request, response){
            templates.serveHtmlRaw(response, './server-templates/pre-signin.html');
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};
