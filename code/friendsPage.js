module.exports = function (app, templates, requestHandlers) {
    'use strict';

    function respondWithJson(response, data) {
        response.writeHead(200, {'content-type': 'application/json' });
        response.write(JSON.stringify(data));
        response.end('\n', 'utf-8');
    }

    function registerHandlers() {

    }

    return {
        registerHandlers : registerHandlers
    };
};