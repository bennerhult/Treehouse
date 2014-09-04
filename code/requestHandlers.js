module.exports = function (thSettings, user) {
    'use strict';

    var nl = '\n'
    var tab = '\t'
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

    function indexPage(response, userId, nrOfFriendShipRequests) {
        serveFromTemplate(
            response,
            './server-templates/index.html',
            { initParams: JSON.stringify({ userId : userId, nrOfFriendShipRequests : nrOfFriendShipRequests }) });
    }

    function publicAchievementPage(response, userId, currentAchievementId, url, imageUrl, title, publiclyVisible) {
        var titleWithSingleQuotationsEscaped = title.replace(/'/g, '&apos;');
        var titleWithDoubleQuotationsReplacedWithSingle = title.replace(/"/g, "'");

        var context = {
            url : url,
            imageUrl : imageUrl,
            title : title,
            titleWithDoubleQuotationsReplacedWithSingle : titleWithDoubleQuotationsReplacedWithSingle,
            contentParams : JSON.stringify({
                achieverId : userId,
                currentAchievementId : currentAchievementId,
                publiclyVisible : publiclyVisible,
                titleWithSingleQuotationsEscaped : titleWithSingleQuotationsEscaped
            })
        };
        serveFromTemplate(
            response,
            './server-templates/achievements.html',
            context);
    }

    function writeDefaultPage(request, response) {
        if (request.session.currentUser) {
            indexPage(response, request.session.currentUser._id, request.session.nrOfFriendShipRequests)
        }   else {
            indexPage(response, null, 0)
        }
    }

    function getPrettyNameIdAndImageURL(id, callback) {
        user.getPrettyNameAndImageURL(id, function(prettyName, imageURL) {
            callback(prettyName, id, imageURL)
        })
    }

    function loadUser(request, response, next) {
        if (request.session.currentUser) {
            user.User.findById(request.session.currentUser._id, function(err, user) {
                if (user) {
                    next()
                } else {
                    response.writeHead(200, {'content-type': 'application/json' })
                    response.write(JSON.stringify(err.message))
                    response.end('\n', 'utf-8')
                }
            })
        } else {
            response.writeHead(200, {'content-type': 'application/json' })
            response.write(JSON.stringify("logged out 2"))
            response.end('\n', 'utf-8')
        }
    }

    return {
        indexPage : indexPage,
        publicAchievementPage : publicAchievementPage,
        writeDefaultPage : writeDefaultPage,
        getPrettyNameIdAndImageURL : getPrettyNameIdAndImageURL,
        loadUser : loadUser
    };
};

