var fs = require('fs'),
    extTypes = require("./extTypes")

var today = new Date()
var nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate()+7)
var nextWeekUTC = nextweek.toUTCString()

function serveFile(fpath, response) {
    fs.exists(fpath, function(exists) {
        if (exists) {
            fs.readFile(fpath, function (error, content) {
                if (error) {
                    response.writeHead(500)
                    response.end()
                } else {
                    var e = extTypes.ext.getExt(fpath)
                    var ct = extTypes.ext.getContentType(e)

                    var stats = fs.statSync(fpath);
                    var mtime = stats.mtime;
                    var size = stats.size;

                    response.writeHead(200, {
                        "Content-Type": ct,
                        "Last-Modified": mtime.toUTCString(),
                        "Expires": nextWeekUTC,
                        "Content-Length": size
                    })
                    response.end(content, 'utf-8')
                }
            })
        } else {
            response.writeHead(404)
            response.end()
        }
    })
}

exports.serve = serveFile