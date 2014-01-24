var nl = '\n'
var tab = '\t'

function gotoAppPage(response) {
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end(topAppPagePart() + gotoAppPart() + bottomPart(), 'utf-8')
}

function gotoAppPart() {
    return '<div id="content">' +
        '<div class="signup-logo"><img src="content/img/logo-large.png">' +
            '<p>You are now logged in. Close this browser and open your Treehouse app.</p>' +
        '</div>'
}

function indexPage(response, userId, nrOfFriendShipRequests) {
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end(topIndexPart(userId, nrOfFriendShipRequests) + bottomPart(), 'utf-8')
}

function publicAchievementPage(response, userId, currentAchievementId, url, imageUrl, title) {
    console.log("writing public achievement page: " + userId )
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.write(topPublicAchievementPart(userId, currentAchievementId, url, imageUrl, title) + bottomPart())
    response.end('\n', 'utf-8')
}

function topAppPagePart() {
    return  '<!DOCTYPE html>' + nl +
        tab + '<html manifest="treehouse.manifest">' + nl +
        tab + '<head>' + nl +
        tab + '<title>Treehouse</title>' + nl +
        tab + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' + nl +
        tab + '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">' + nl +
        tab + '<meta name="apple-mobile-web-app-capable" content="yes">' + nl +
        tab + '<meta name="apple-mobile-web-app-status-bar-style" content="black" />' + nl +
        tab + '<link rel="apple-touch-icon" href="/content/treehouse-icon.png">' + nl +
        tab + '<link href="/content/img/startup320x460.png" rel="apple-touch-startup-image" media="(device-width: 320px)"  />' + nl +
        tab + '<link href="/content/img/startup640x920.png" media="(device-width: 320px) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image">' + nl +
        tab + '<link href="/content/img/startup768x1004.png" media="(device-width: 768px) and (orientation: portrait)" rel="apple-touch-startup-image">' + nl +
        tab + '<link href="/content/img/startup748x1024.png" media="(device-width: 768px) and (orientation: landscape)" rel="apple-touch-startup-image">' + nl +
        tab + '<link href="/content/img/startup1536x2008.png" media="(device-width: 1536px) and (orientation: portrait) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image">' + nl +
        tab + '<link href="/content/img/startup1496x2048.png" media="(device-width: 1536px) and (orientation: landscape) and (-webkit-device-pixel-ratio: 2)" rel="apple-touch-startup-image">' + nl +
        tab + '<meta name="description" content="Treehouse helps you track your achievements. Explore. Achieve. Play!" />' + nl +
        tab + '<meta name="keywords" content="Gamification, achievement, achieve, track" />' + nl +
        tab + '<meta property="og:site_name" content="Treehouse" />' + nl +
        tab + '<meta property="og:title" content="Treehouse. Track your achievements!" />' + nl +
        tab + '<meta property="og:type" content="article" />' + nl +
        tab + '<meta property="og:image" content="http://treehouse.io/content/img/treehouse.jpg"/>' + nl +
        tab + '<meta property="og:url" content="http://treehouse.io/"/>' + nl +
        tab + '<link rel="icon" href="/content/favicon.ico" type="image/vnd.microsoft.icon">' + nl +
        tab + '<script type="text/javascript" src="content/js/css3-mediaqueries.js"></script>' + nl +
        tab + '<script src="content/ext/js/facebook.js" type="text/javascript"></script>' + nl +
        tab + '<script src="content/ext/js/jquery-1.10.2.js" type="text/javascript"></script>' + nl +
        tab + '<script type="application/javascript" src="content/js/add2home.js"></script>' + nl +
        tab + '<script type="application/javascript" src="content/js/generateContent.js"></script>' + nl +
        tab + '<script type="application/javascript" src="content/js/info.js"></script>' + nl +
        tab + '<script type="application/javascript" src="content/js/treehouseFunctions.js"></script>' + nl +
        tab + '<script type="application/javascript" src="content/js/magnetic.js"></script>' + nl +
        tab + '<script type="text/javascript">(function(a){if(window.filepicker){return}var b=a.createElement("script");b.type="text/javascript";b.async=!0;b.src=("https:"===a.location.protocol?"https:":"http:")+"//api.filepicker.io/v1/filepicker.js";var c=a.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c);var d={};d._queue=[];var e="pick,pickMultiple,pickAndStore,read,write,writeUrl,export,convert,store,storeUrl,remove,stat,setKey,constructWidget,makeDropPane".split(",");var f=function(a,b){return function(){b.push([a,arguments])}};for(var g=0;g<e.length;g++){d[e[g]]=f(e[g],d._queue)}window.filepicker=d})(document);</script>' + nl +
        tab + '<link rel="stylesheet" href="content/css/add2home.css">' + nl +
        tab + '<link rel="stylesheet" href="content/css/core.css" media="screen, projection, print" />' + nl +
        tab + '<link href="http://fonts.googleapis.com/css?family=Philosopher" rel="stylesheet" type="text/css">' + nl +
        tab + '<link href="http://fonts.googleapis.com/css?family=Dosis" rel="stylesheet" type="text/css">' + nl +
        tab + '</head>' + nl +
        tab + ' <body>' + nl +
        '<div id="fb-root"></div>' + nl +
        '<div id="page-login">' + nl +
        '<div id="web-menu">' + nl +
        '<ul>' + nl +
        '<li class="first"><a href="javascript:void(0)" onclick="showInfo(getStart(), 0)"><span class="selected"><img src="content/img/logo-small.png" /></span></a></li>'  + nl +
        '<li><a href="javascript:void(0)" onclick="showInfo(getAbout(), 2)"><span>About</span></a> </li>'  + nl +
        '<li><a href="javascript:void(0)" onclick="showInfo(getMiscInfo(), 2)"><span>Miscellany</span></a> </li>'  + nl +
        '<li><a href="javascript:void(0)" onclick="showInfo(getAbout(), 3)"><span>About</span></a> </li>'  + nl +
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
        '<div id="topMenuArea"></div>' + nl +
        '<div id="menuArea"></div>' + nl +
        '<div id="app-container-login">' + nl +
        '<div id="contentArea">'
}


function topIndexPart(userId, nrOfFriendShipRequests) {
    console.log("top index part: " + userId)
           return '<!DOCTYPE html>' + nl +
            tab + '<html>' + nl +
                tab + '<head>' + nl +
                    tab + '<title>Treehouse</title>' + nl +
                    tab + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' + nl +
                    tab + '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">' + nl +
                    tab + '<meta name="apple-mobile-web-app-capable" content="yes">' + nl +
                    tab + '<meta name="apple-mobile-web-app-status-bar-style" content="black" />' + nl +
                    tab + '<link rel="apple-touch-icon" href="/content/treehouse-icon.png">' + nl +
                    tab + '<meta name="description" content="Treehouse helps you track your achievements. Explore. Achieve. Play!" />' + nl +
                    tab + '<meta name="keywords" content="Gamification, achievement, achieve, track" />' + nl +
                    tab + '<meta property="og:site_name" content="Treehouse" />' + nl +
                    tab + '<meta property="og:title" content="Treehouse. Track your achievements!" />' + nl +
                    tab + '<meta property="og:type" content="article" />' + nl +
                    tab + '<meta property="og:image" content="http://treehouse.io/content/img/treehouse.jpg"/>' + nl +
                    tab + '<meta property="og:url" content="http://treehouse.io/"/>' + nl +
                    tab + '<link rel="icon" href="/content/favicon.ico" type="image/vnd.microsoft.icon">' + nl +
                    tab + '<script type="text/javascript" src="content/js/css3-mediaqueries.js"></script>' + nl +
                    tab + '<script src="content/ext/js/facebook.js" type="text/javascript"></script>' + nl +
                    tab + '<script src="content/ext/js/jquery-1.10.2.js" type="text/javascript"></script>' + nl +
                    tab + '<script type="application/javascript" src="content/js/add2home.js"></script>' + nl +
                    tab + '<script type="application/javascript" src="content/js/generateContent.js"></script>' + nl +
                    tab + '<script type="application/javascript" src="content/js/info.js"></script>' + nl +
                    tab + '<script type="application/javascript" src="content/js/treehouseFunctions.js"></script>' + nl +
                    tab + '<script type="application/javascript" src="content/js/magnetic.js"></script>' + nl +
                    tab + '<script type="text/javascript">(function(a){if(window.filepicker){return}var b=a.createElement("script");b.type="text/javascript";b.async=!0;b.src=("https:"===a.location.protocol?"https:":"http:")+"//api.filepicker.io/v1/filepicker.js";var c=a.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c);var d={};d._queue=[];var e="pick,pickMultiple,pickAndStore,read,write,writeUrl,export,convert,store,storeUrl,remove,stat,setKey,constructWidget,makeDropPane".split(",");var f=function(a,b){return function(){b.push([a,arguments])}};for(var g=0;g<e.length;g++){d[e[g]]=f(e[g],d._queue)}window.filepicker=d})(document);</script>' + nl +
                    tab + '<link rel="stylesheet" href="content/css/add2home.css">' + nl +
                    tab + '<link rel="stylesheet" href="content/css/core.css" media="screen, projection, print" />' + nl +
                    tab + '<link href="http://fonts.googleapis.com/css?family=Philosopher" rel="stylesheet" type="text/css">' + nl +
                    tab + '<link href="http://fonts.googleapis.com/css?family=Dosis" rel="stylesheet" type="text/css">' + nl +
                    tab + '<script type="text/javascript">' + nl +
                    tab + '$(document).ready(function() {' + nl  +
                    tab + 'init(\'' + userId  + '\', \'' + nrOfFriendShipRequests  + '\')' + nl  +
                    tab + 'rememberMe()'   + nl +
                    tab   + 'setTimeout(function(){addToHome.show(false)}, 100)})</script>' + nl +
                tab + '</head>' + nl +
                tab + ' <body>' + nl +
                '<div id="fb-root"></div>' + nl +
                '<div id="page">' + nl +
                '<canvas id="world" width="100%" height="100%" style="z-index:998; position: absolute; left: 0; top: 0;"><p class="noCanvas">You need a <a href="http://www.google.com/chrome">modern browser</a> to view this.</p></canvas>' +
                '<div id="web-menu">' + nl +
                    '<ul>' + nl +
                        '<li class="first"><a href="javascript:void(0)" onclick="showInfo(getStart(), 0)"><span class="selected"><img src="content/img/logo-small.png" /></span></a></li>'  + nl +
                        '<li><a href="javascript:void(0)" onclick="showInfo(getAchievementInfo(), 1)"><span>Achievements</span></a> </li>'  + nl +
                        '<li><a href="javascript:void(0)" onclick="showInfo(getMiscInfo(), 2)"><span>Miscellany</span></a> </li>'  + nl +
                        '<li><a href="javascript:void(0)" onclick="showInfo(getAbout(), 3)"><span>About</span></a> </li>'  + nl +
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
                '<div id="topMenuArea"></div>' + nl +
                '<div id="menuArea"></div>' + nl +
                '<div id="app-container">' + nl +
                '<div id="contentArea">'
}

function topPublicAchievementPart(achieverId, currentAchievementId, url, imageUrl, title) {
    console.log("topPublicAchievementPart: " + achieverId + ", " + url)
    return (
        '<!DOCTYPE html>' + nl +
            tab + '<html>' + nl +
            tab + '<head>' + nl +
            tab + '<title>Treehouse - ' + title + '</title>' + nl +
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
            tab + '<script type="text/javascript" src="content/js/css3-mediaqueries.js"></script>' + nl +
            tab + '<script src="content/ext/js/facebook.js" type="text/javascript"></script>' + nl +
            tab + '<script src="content/ext/js/jquery-1.10.2.js" type="text/javascript"></script>' + nl +
            tab + '<script type="application/javascript" src="content/js/add2home.js"></script>' + nl +
            tab + '<script type="application/javascript" src="content/js/generateContent.js"></script>' + nl +
            tab + '<script type="application/javascript" src="content/js/info.js"></script>' + nl +
            tab + '<script type="application/javascript" src="content/js/treehouseFunctions.js"></script>' + nl +
            tab + '<script type="application/javascript" src="content/js/magnetic.js"></script>' + nl +
            tab + '<script type="text/javascript">(function(a){if(window.filepicker){return}var b=a.createElement("script");b.type="text/javascript";b.async=!0;b.src=("https:"===a.location.protocol?"https:":"http:")+"//api.filepicker.io/v1/filepicker.js";var c=a.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c);var d={};d._queue=[];var e="pick,pickMultiple,pickAndStore,read,write,writeUrl,export,convert,store,storeUrl,remove,stat,setKey,constructWidget,makeDropPane".split(",");var f=function(a,b){return function(){b.push([a,arguments])}};for(var g=0;g<e.length;g++){d[e[g]]=f(e[g],d._queue)}window.filepicker=d})(document);</script>' + nl +
            tab + '<link rel="stylesheet" href="content/css/add2home.css">' + nl +
            tab + '<link rel="stylesheet" href="content/css/core.css" media="screen, projection, print" />' + nl +
            tab + '<link href="http://fonts.googleapis.com/css?family=Philosopher" rel="stylesheet" type="text/css">' + nl +
            tab + '<link href="http://fonts.googleapis.com/css?family=Dosis" rel="stylesheet" type="text/css">' + nl +
            tab + '<script type="text/javascript">' + nl +
            tab + '$(document).ready(function() {' + nl +
            tab + 'init()' + nl +
            tab + 'insertContent(getPublicAchievementContent(), setDefaultMenu(\'' + title + '\', false), function() {' + nl +
            tab + 'getPublicAchievement(\'' + achieverId + '\',  \'' +currentAchievementId + '\')' + nl +
            tab + '})' + nl +
            tab + '})' + nl +
            tab + '</script>' + nl +
            tab + '</head>' + nl +
            tab + ' <body>' + nl +
            '<div id="fb-root"></div>' + nl +
            '<div id="page">' + nl +
            '<canvas id="world" width="100%" height="100%" style="z-index:998; position: absolute; left: 0; top: 0;"><p class="noCanvas">You need a <a href="http://www.google.com/chrome">modern browser</a> to view this.</p></canvas>' +
            '<div id="web-menu">' + nl +
                '<ul>' + nl +
                    '<li class="first"><a href="javascript:void(0)" onclick="showInfo(getStart(), 0)"><span class="selected"><img src="content/img/logo-small.png" /></span></a></li>'  + nl +
                    '<li><a href="javascript:void(0)" onclick="showInfo(getAchievementInfo(), 1)"><span>Achievements</span></a> </li>'  + nl +
                    '<li><a href="javascript:void(0)" onclick="showInfo(getMiscInfo(), 2)"><span>Miscellany</span></a> </li>'  + nl +
                    '<li><a href="javascript:void(0)" onclick="showInfo(getAbout(), 3)"><span>About</span></a> </li>'  + nl +
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
            '<div id="topMenuArea"></div>' + nl +
            '<div id="menuArea"></div>' + nl +
            '<div id="app-container">' + nl +
            '<div id="contentArea">'
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

exports.gotoAppPage = gotoAppPage
exports.indexPage = indexPage
exports.publicAchievementPage = publicAchievementPage