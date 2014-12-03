module.exports = function (app, templates, thSettings) {
    'use strict';

    function registerHandlers() {
        app.get('/app/friends', function (request, response){
            templates.serveHtmlFromTemplate(response, './server-templates/friends.html', {});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};