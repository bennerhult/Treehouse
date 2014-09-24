module.exports = function (app, templates, thSettings) {
    'use strict';

    function registerHandlers() {
        app.get('/friends2', function (request, response){
            templates.serveHtmlFromTemplate(response, './server-templates/friends.html', {});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};
