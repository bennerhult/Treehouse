module.exports = function (app, templates, thSettings) {
    'use strict';

    function registerHandlers() {
        app.get('/preLogin', function (request, response){
            templates.serveHtmlFromTemplate(response, './server-templates/pre-login.html', {});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};