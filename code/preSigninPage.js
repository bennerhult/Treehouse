module.exports = function (app, templates) {
    'use strict';

    function registerHandlers() {
        app.get('/', function (request, response){
            templates.serveHtmlRaw(response, './server-templates/treehouse.html', {});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};
