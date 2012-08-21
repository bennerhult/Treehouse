var nl = '\n'
var tab = '\t'

function indexPage(response) {
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end(topIndexPart() + bottomPart(), 'utf-8')
}

function publicAchievementPage(response, userId, currentAchievementId, url, imageUrl, title) {
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.write(topPublicAchievementPart(userId, currentAchievementId, url, imageUrl, title) + bottomPart())
    response.end('\n', 'utf-8')
}

function topIndexPart() {
            var text = '<!DOCTYPE html>' + nl +
            tab + '<html manifest="treehouse.manifest">' + nl +
                tab + '<head>' + nl +
                    tab + '<title>Treehouse</title>' + nl +
                    tab + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' + nl +
                    tab + '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">' + nl +
                    tab + '<meta name="apple-mobile-web-app-capable" content="yes">' + nl +
                    tab + '<meta name="apple-mobile-web-app-status-bar-style" content="black" />' + nl +
                    tab + '<link rel="apple-touch-icon" href="/content/treehouse-icon.png">' + nl +
                    tab + '<meta property="og:site_name" content="Treehouse" />' + nl +
                    tab + '<meta property="og:title" content="Treehouse. Track your achievements!" />' + nl +
                    tab + '<meta property="og:type" content="article" />' + nl +
                    tab + '<meta property="og:image" content="http://treehouse.io/content/img/treehouse.jpg"/>' + nl +
                    tab + '<meta property="og:url" content="http://www.treehouse.io"/>' + nl +
                    tab + '<link rel="icon" href="/content/favicon.ico" type="image/vnd.microsoft.icon">' + nl +
                    tab + '<script type="application/javascript" src="content/js/add2home.js"></script>' + nl +
                    tab + '<script type="application/javascript" src="content/js/iscroll.js"></script>' + nl +
                    tab + '<script type="application/javascript" src="content/js/generateContent.js"></script>' + nl +
                    tab + '<script type="application/javascript" src="content/js/info.js"></script>' + nl +
                    tab + '<script type="application/javascript" src="content/js/treehouseFunctions.js"></script>' + nl +
                    tab + '<script type="text/javascript" src="content/js/css3-mediaqueries.js"></script>' + nl +
                    tab + '<script src="content/ext/js/facebook.js" type="text/javascript"></script>' + nl +
                    tab + '<script src="content/ext/js/jquery.1.7.2.min.js" type="text/javascript"></script>' + nl +
                    tab + '<link rel="stylesheet" href="content/css/add2home.css">' + nl +
                    tab + '<link rel="stylesheet" href="content/css/core.css" media="screen, projection, print" />' + nl +
                    tab + '<link href="http://fonts.googleapis.com/css?family=Philosopher" rel="stylesheet" type="text/css">' + nl +
                    tab + '<link href="http://fonts.googleapis.com/css?family=Dosis" rel="stylesheet" type="text/css">' + nl +
                    tab + '<script type="text/javascript">' + nl +
                    tab + '$(document).ready(function() {' + nl  +
                     tab   + 'setTimeout(function(){addToHome.show(false)}, 100)' + nl +
                     tab + 'rememberMe()'   +nl +
                    tab   +  '})</script>' + nl +
                tab + '</head>' + nl +
                tab + ' <body onload="init()">' + nl +
                '<div id="fb-root"></div>' + nl +
                '<div id="page">' + nl +
                '<div id="web-menu">' + nl +
                    '<ul>' + nl +
                        '<li class="first"><a href="javascript:void(0)" onclick="showInfo(getStart(), 0)"><span class="selected"><img src="content/img/logo-small.png" /></span></a></li>'  + nl +
                        '<li><a href="javascript:void(0)" onclick="showInfo(getAchievementInfo(), 1)"><span>Achievements</span></a> </li>'  + nl +
                        '<li><a href="javascript:void(0)" onclick="showInfo(getAbout(), 2)"><span>About</span></a> </li>'  + nl +
                    '</ul>' + nl +
                    '<div class="clear"></div>' + nl +
                '</div>' + nl +
                '<div id="main-container">' + nl +
                '<div id="leftcontainer">' + nl +
                    '<div class="web-wrap ipad">' + nl +
                '<h1>Treehouse helps you track your achievements.</h1>' + nl +
                '<p class="ingress">Explore. Achieve. Play.</p>' + nl +
                    '</div>' + nl +
                    '<div id="infoArea"></div>' + nl +
                '</div>' + nl +
                '<div id="rightcontainer">' + nl +
                '<div class="web-wrap desktop">' + nl +
                '<h1>Treehouse helps you track your achievements.</h1>' + nl +
                '<p class="ingress">Explore. Achieve. Play.</p>' + nl +
                '</div>' + nl +
                '<div id="app-container">' + nl +
                tab + ' <div id="contentArea">'
   return text
}

function topPublicAchievementPart(userId, currentAchievementId, url, imageUrl, title) {
    return (
        '<!DOCTYPE html>' + nl +
            tab + '<html  manifest="treehouse.manifest">' + nl +
            tab + '<head>' + nl +
            tab + '<title>Treehouse</title>' + nl +
            tab + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' + nl +
            tab + '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">' + nl +
            tab + '<meta name="apple-mobile-web-app-capable" content="yes">' + nl +
            tab + '<meta name="apple-mobile-web-app-status-bar-style" content="black" />' + nl +
            tab + '<link rel="apple-touch-icon" href="/content/treehouse-icon.png">' + nl +
            tab + '<meta property="og:site_name" content="Treehouse" />' + nl +
            tab + '<meta property="og:title" content="Treehouse: ' + title + '" />' + nl +
            tab + '<meta property="og:type" content="article" />' + nl +
            tab + '<meta property="og:image" content="http://treehouse.io/' + imageUrl + '"/>' + nl +
            tab + '<meta property="og:url" content="http://treehouse.io' + url + '"/>' + nl +
            tab + '<link rel="icon" href="/content/favicon.ico" type="image/vnd.microsoft.icon">' + nl +
            tab + '<script type="application/javascript" src="content/js/add2home.js"></script>' + nl +
            tab + '<script type="application/javascript" src="content/js/iscroll.js"></script>' + nl +
            tab + '<script type="application/javascript" src="content/js/generateContent.js"></script>' + nl +
            tab + '<script type="application/javascript" src="content/js/info.js"></script>' + nl +
            tab + '<script type="application/javascript" src="content/js/treehouseFunctions.js"></script>' + nl +
            tab + '<script type="text/javascript" src="content/js/css3-mediaqueries.js"></script>' + nl +
            tab + '<script src="content/ext/js/facebook.js" type="text/javascript"></script>' + nl +
            tab + '<script src="content/ext/js/jquery.1.7.2.min.js" type="text/javascript"></script>' + nl +
            tab + '<link rel="stylesheet" href="content/css/add2home.css">' + nl +
            tab + '<link rel="stylesheet" href="content/css/core.css" media="screen, projection, print" />' + nl +
            tab + '<link href="http://fonts.googleapis.com/css?family=Philosopher" rel="stylesheet" type="text/css">' + nl +
            tab + '<link href="http://fonts.googleapis.com/css?family=Dosis" rel="stylesheet" type="text/css">' + nl +
            tab + '<script type="text/javascript">' + nl +
            tab + '$(document).ready(function() {' + nl +
            tab + 'insertContent(getPublicAchievementContent(), function() {' + nl +
            tab + 'getPublicAchievement(\'' +currentAchievementId + '\', \'' + userId + '\', \'true\')' + nl +
            tab + '})' + nl +
            tab + '})' + nl +
            tab + '</script>' + nl +
            tab + '</head>' + nl +
            tab + ' <body onload="init()">' + nl +
            '<div id="fb-root"></div>' + nl +
            '<div id="page">' + nl +
            '<div id="web-menu">' + nl +
                '<ul>' + nl +
                    '<li class="first"><a href="javascript:void(0)" onclick="showInfo(getStart(), 0)"><span class="selected"><img src="content/img/logo-small.png" /></span></a></li>'  + nl +
                    '<li><a href="javascript:void(0)" onclick="showInfo(getAchievementInfo(), 1)"><span>Achievements</span></a> </li>'  + nl +
                    '<li><a href="javascript:void(0)" onclick="showInfo(getAbout(), 2)"><span>About</span></a> </li>'  + nl +
                '</ul>' + nl +
                 '<div class="clear"></div>' + nl +
            '</div>' + nl +
            '<div id="main-container">' + nl +
            '<div id="leftcontainer">' + nl +
                '<div class="web-wrap ipad">' + nl +
                    '<h1>Treehouse helps you track your achievements.</h1>' + nl +
                    '<p class="ingress">Explore. Achieve. Play.</p>' + nl +
                '</div>' + nl +
                '<div id="infoArea"></div>' + nl +
            '</div>' + nl +
            '<div id="rightcontainer">' + nl +
            '<div class="web-wrap desktop">' + nl +
            '<h1>Treehouse helps you track your achievements.</h1>' + nl +
            '<p class="ingress">Explore. Achieve. Play.</p>' + nl +
            '</div>' + nl +
            '<div id="app-container">' + nl +
            tab + '<div id="contentArea">'
        )
}

function bottomPart() {
    return (
                                '</div>' + nl +
                            '</div>' + nl +
                        '</div>' + nl +

                        '<div class="clear"></div>' + nl +
                    '</div>' + nl +
                        '<div id="web-footer"></div>' + nl +
                        '<div class="clear"></div>' + nl +
                        '<div id="banner" class="banner">Flip for more info</div>' + nl +
                    '</div>' + nl +
                '</body>' + nl +
            '</html>' + nl
        )
}

exports.indexPage = indexPage
exports.publicAchievementPage = publicAchievementPage