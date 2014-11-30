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

    return {
        indexPage : indexPage,
        publicAchievementPage : publicAchievementPage,
        writeDefaultPage : writeDefaultPage,
        getPrettyNameIdAndImageURL : getPrettyNameIdAndImageURL
    };
};

