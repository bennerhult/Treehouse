module.exports = function (app, templates, thSettings) {
    'use strict';

    function registerHandlers() {
        app.get('/', function (request, response) {     
            var isFacebookBot = request.headers['user-agent'].indexOf('facebookexternalhit') > -1; 
            if (!isFacebookBot) {                                            
                templates.serveHtmlRaw(response, './server-templates/treehouse.html', {});      
            } else {
                var fileText = 
                '<!DOCTYPE html>' +
                '<html lang="en" xmlns:fb="http://www.facebook.com/2008/fbml">' +  
                    '<head>' +
                        '<title>Treehouse</title>' +
                        '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' + 
                        '<meta name="description" content="Treehouse helps you track your achievements. Explore. Achieve. Play!" />' + 
                        '<meta name="keywords" content="Gamification, achievement, achieve, track" />' + 
                        '<meta property="og:site_name" content="Treehouse" />' + 
                        '<meta property="og:title" content="Treehouse. Track your achievements!" />' + 
                        '<meta property="og:description" content="Treehouse helps you track your achievements. Explore. Achieve. Play!" />' + 
                        '<meta property="og:type" content="article" />' + 
                        '<meta property="og:image" content="' + thSettings.getDomain() + 'content/img/treehouse.jpg" />' + 
                        '<meta property="og:url" content="' + thSettings.getDomain() + '" />' + 
                    '</head>' + 
                    '<body>HI' + 
                    '</body>' +
                '</html>'
                response.writeHead(200, { 'Content-Type': 'text/html' })
                response.end(fileText, 'utf-8')
            }
        });
    }

    return {
        registerHandlers: registerHandlers
    };
};