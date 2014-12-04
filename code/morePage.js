module.exports = function (app, templates, thSettings) {
    'use strict';

    function registerHandlers() {
        app.get('/app/more', function (request, response){
            templates.serveHtmlFromTemplate(response, './server-templates/more.html', {});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};