module.exports = function (thSettings) {
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

    return {
        renderFile : renderFile
    };
}
