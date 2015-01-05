module.exports = function (app, templates) {
    'use strict';

    function registerHandlers() {
        app.get('/preSignin', function (request, response){
            templates.serveHtmlRaw(response, './server-templates/treehouse.html', {});
        });
    }

    return {
        registerHandlers : registerHandlers
    };
};
