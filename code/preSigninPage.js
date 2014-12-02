module.exports = function (app, templates, thSettings) {
    'use strict';

    function registerHandlers() {
        app.get('/preSignin', function (request, response){
            templates.serveHtmlFromTemplate(response, './server-templates/pre-signin.html', {});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};
