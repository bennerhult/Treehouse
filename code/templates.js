module.exports = function (thSettings) {
    'use strict';
    var dict = require('dict'),
        mustache = require('mustache'), //https://github.com/janl/mustache.js
        fs = require('fs'),
        cache;

    cache = dict();

    function readFileCached(fileName, options, callback) {
        if(thSettings.isProduction() && cache.has(fileName)) {
            callback(cache.get(fileName));
        } else {
            fs.readFile(fileName, options, function (err, templateText) {
                if(err) {
                    callback(err, null);
                } else {
                    if(thSettings.isProduction()) {
                        cache.set(fileName, templateText);
                    }
                    callback(null, templateText);
                }
            });
        }
    }

    function renderFile(fileName, context, callback) {
        readFileCached(fileName, { encoding : 'utf-8' }, function (err, templateText) {
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
