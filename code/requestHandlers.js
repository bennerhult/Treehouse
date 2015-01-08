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

    function getPrettyNameIdAndImageURL(id, callback) {
        user.getPrettyNameAndImageURL(id, function(prettyName, imageURL) {
            callback(prettyName, id, imageURL)
        })
    }

    function respondWithJson(response, data) {
        response.writeHead(200, {'content-type': 'application/json' });
        response.write(JSON.stringify(data));
        response.end('\n', 'utf-8');
    }

    return {
        getPrettyNameIdAndImageURL : getPrettyNameIdAndImageURL,
        respondWithJson : respondWithJson
    };
};