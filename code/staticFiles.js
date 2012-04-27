var path = require('path'),
    fs = require('fs'),
    extTypes = require("./extTypes");

function serveFile(fpath, response) {
    path.exists(fpath, function(exists) {
        if (exists) {
            fs.readFile(fpath, function (error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                } else {
                    var e = extTypes.ext.getExt(fpath);
                    var ct = extTypes.ext.getContentType(e);
                    response.writeHead(200, { 'Content-Type': ct });
                    response.end(content, 'utf-8');
                }
            });
        } else {
            response.writeHead(404);
            response.end();
        }
    });
}

exports.serve = serveFile;