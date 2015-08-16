module.exports = function (app, templates, requestHandlers, achievementInstance, user, thSettings) {
    'use strict';

    function registerHandlers() {
        app.get('/public/achievementInstance/:achievementInstanceId', function (request, response) {  
            var isFacebookBot = request.headers['user-agent'].indexOf('facebookexternalhit') > -1;            
            if (!isFacebookBot) {                                            
                templates.serveHtmlRaw(response, './server-templates/treehouse.html', {});      
            } else {
                var achievementId = request.url.substring(request.url.indexOf('/achievementInstance/') + 21);
                achievementInstance.getPublicAchievement(achievementId, function(achievementInstance) {
                    if (achievementInstance && achievementInstance.publiclyVisible) {
                        var fileText = 
                        '<!DOCTYPE html>' +
                        '<html lang="en" xmlns:fb="http://www.facebook.com/2008/fbml">' +  
                            '<head>' +
                                '<title>Treehouse</title>' +
                                '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' + 
                                '<meta name="description" content="Treehouse helps you track your achievements. Explore. Achieve. Play!" />' + 
                                '<meta name="keywords" content="Gamification, achievement, achieve, track" />' + 
                                '<meta property="og:site_name" content="Treehouse" />' + 
                                '<meta property="og:title" content="' + achievementInstance.title + '" />' + 
                                '<meta property="og:description" content="' + achievementInstance.description + '" />' + 
                                '<meta property="og:type" content="article" />' + 
                                '<meta property="og:image" content="' + thSettings.getDomain().substring(0, thSettings.getDomain().length - 1) + achievementInstance.imageURL + '" />' + 
                                '<meta property="og:url" content="' +  thSettings.getDomain().substring(0, thSettings.getDomain().length - 1) + request.url + '" />' + 
                            '</head>' + 
                            '<body>' + 
                            '</body>' +
                        '</html>'
                        response.writeHead(200, { 'Content-Type': 'text/html' })
                        response.end(fileText, 'utf-8')
                            }
                });
                
            }
        });

        app.post('/api/publicAchievement/init', function (request, response) {
            achievementInstance.getPublicAchievement(request.body.achievementInstanceId, function(achievementInstance) {
                if (achievementInstance) {
                    user.User.findById(achievementInstance.createdBy, function(err2, createdBy) {
                        return requestHandlers.respondWithJson(response, { achievementInstance: achievementInstance,  createdBy: createdBy});
                    });
                } else {
                    return requestHandlers.respondWithJson(response, {});
                }
            });
        });
    }

    return {
        registerHandlers : registerHandlers
    };
}