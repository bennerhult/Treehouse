module.exports = function (app, templates) {
    'use strict';

    function registerHandlers() {
        app.get('/app/achievementInstance/:achievementInstanceId', function (request, response) {
            templates.serveHtmlRaw(response, './server-templates/treehouse.html', {});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}