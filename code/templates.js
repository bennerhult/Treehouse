module.exports = function () {
    'use strict';
    var dict = require('dict'),
        mustache = require('mustache'), //https://github.com/janl/mustache.js
        fs = require('fs');

    function renderFile(fileName, context, callback) {
        fs.readFile(fileName, { encoding : 'utf-8' }, function (err, templateText) {
            var renderedTemplate;
            if(err) {
                callback(err, null);
            } else {
                renderedTemplate = mustache.render(templateText, context);
                if (callback) {
                    callback(null, renderedTemplate);
                }
            }
        });
    }

    function serveHtmlRaw(response, fileName) { //TODO: Serve directly from CDN instead
        fs.readFile(fileName, { encoding : 'utf-8' }, function (err, fileText) {
            if(err) throw err;
            response.writeHead(200, { 'Content-Type': 'text/html' })
            response.end(fileText, 'utf-8')
        });
    }

    return {
        renderFile : renderFile,
        serveHtmlRaw : serveHtmlRaw
    };
}