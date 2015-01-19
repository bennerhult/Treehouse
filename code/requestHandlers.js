module.exports = function (thSettings, user) {
    'use strict';
    
    var templates = require('./templates.js')(thSettings);

    function serveFromTemplate(response, templateName, context) {
        templates.renderFile(
            templateName,
            context,
            function (err, renderedPage) {
                if(err) throw err;
                response.writeHead(200, { 'Content-Type': 'text/html' })
                response.end(renderedPage, 'utf-8')
            });
    }

    function getUserData(id, callback) {
        user.getUserData(id, function(firstName, lastName, username, imageURL) {
            callback(firstName, lastName, username, imageURL)
        })
    }

    function respondWithJson(response, data) {
        response.writeHead(200, {'content-type': 'application/json' });
        response.write(JSON.stringify(data));
        response.end('\n', 'utf-8');
    }

    return {
        getUserData : getUserData,
        respondWithJson : respondWithJson
    };
};