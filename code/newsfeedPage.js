module.exports = function (app, templates, thSettings) {
    'use strict';

    function registerHandlers() {
        app.get('/newsfeed2', function (request, response){
            templates.serveHtmlFromTemplate(response, './server-templates/newsfeed.html', {});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};
