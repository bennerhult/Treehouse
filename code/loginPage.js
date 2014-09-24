module.exports = function (app, templates, thSettings) {
    'use strict';

    function registerHandlers() {
        app.get('/login2', function (request, response){
            templates.serveHtmlFromTemplate(response, './server-templates/login.html', {});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};
