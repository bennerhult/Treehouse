exports.ext = function () {
    var extTypes = {
        "css"           : "text/css"
        , "gif"         : "image/gif"
        , "html"        : "text/html"
        , "ico"         : "image/vnd.microsoft.icon"
        , "js"          : "application/javascript"
        , "json"        : "application/json"
        , "manifest"    : "text/cache-manifest"
        , "png"         : "image/png"

    }
    return {
        getExt: function (path) {
            var i = path.lastIndexOf('.')
            return (i < 0) ? '' : path.substr(i + 1)
        },
        getContentType: function (ext) {
            return extTypes[ext.toLowerCase()] || 'text/plain'
        }
    }
}()