var nl = '\n'
var tab = '\t'

function indexPage(response, userId, nrOfFriendShipRequests) {
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end(topIndexPart(userId, nrOfFriendShipRequests) + bottomPart(), 'utf-8')
}

function publicAchievementPage(response, userId, currentAchievementId, url, imageUrl, title, publiclyVisible) {
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.write(topPublicAchievementPart(userId, currentAchievementId, url, imageUrl, title, publiclyVisible) + bottomPart())
    response.end('\n', 'utf-8')
}

function topIndexPart(userId, nrOfFriendShipRequests) {
    return '<!DOCTYPE html>' + nl +
        tab + '<html lang="en" xmlns:fb="http://www.facebook.com/2008/fbml">' + nl +
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
        tab + '<meta property="og:image" content="http://www.treehouse.io/content/img/treehouse.jpg"/>' + nl +
        tab + '<meta property="og:url" content="http://www.treehouse.io/"/>' + nl +
        tab + '<link rel="icon" href="/content/favicon.ico" type="image/vnd.microsoft.icon">' + nl +
        tab + '<script> ' + nl +
        tab + '(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){' + nl +
        tab + '(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),' + nl +
        tab + 'm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)' + nl +
        tab + '})(window,document,"script","//www.google-analytics.com/analytics.js","ga");' + nl +
        tab + 'ga("create", "UA-47638344-1", "www.treehouse.io");' + nl +
        tab + 'ga("send", "pageview");' + nl +
        tab + '</script>  ' + nl +
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
        tab + 'setTimeout(function(){addToHome.show(false)}, 100)})</script>' + nl +
        tab + '</head>' + nl +
        tab + ' <body onresize="resize_canvas()">' + nl +

        '<div id="fb-root"></div>' + nl +
        '<div class="preLogin none">' + nl +
            '<div class="logo"><img src="content/img/logo-firstpage.png"></div>' + nl +
            '<div class="content">' + nl +
                '<h1>What did you do lately?</h1>' + nl +
                '<div class="examplesWrap">' + nl +
                    '<ul><li><a href=""><img src="content/img/achievementImages/50.png"><h2>Read the classics: Age of Enlightenment</h2><p>Discover the cultural movement in late 17th-century Europe emphasizing reason and individualism.</p></a></li>' +
                    '<li><a href=""><img src="content/img/achievementImages/52.png"><h2>Botkyrka: the finnish heritage</h2><p>Did you know that Botkyrka shares some of its cultural heritage with Finland. Get to know why.</p></a></li>' +
                    '<li><a href=""><img src="content/img/achievementImages/27.png"><h2>Stockholm Library Tour</h2><p>They\'re free, they\'re beautiful and they\'re good. Read you way through the capital of Sweden</p></a></li>' +
                    '<li><a href=""><img src="content/img/achievementImages/51.png"><h2>Travel: East Asia Highlights</h2><p>Explore Bangkok, Go Jungle Trekking, Admire Angkor Wat. The possibilites are endless.</p></a></li>' +
                    '<li><a href=""><img src="content/img/achievementImages/53.png"><h2>Botkyrka: industrial history</h2><p>During the 18th century, Botkyrka produced paper bills for the Swedish National Bank inspired by Dutch craftsmen.</p></a></li></ul></div><div class="clear"> ' +
                '</div>' + nl +
                '<div class="to-login-button"><a href=""><span>Get started / Log in</span></a></div>' + nl +
                '<div class="wrap">' +
                    '<div class="fiftywidth">' +
                        '<h2>Deciding what to do next?</h2>' +
                        '<p>The Treehouse app helps you track and share your achievements. Log in to get inspired by locals and people from all over the world.</p>' +
                    '</div>' +
                    '<div class="fiftywidth">' +
                        '<h2>What are your friends doing?</h2>' +
                        '<p>Find out what your friends are up to and issue challenges. Share your progress on Facebook or Twitter.</p>' +
                    '</div>' +
                    '<div class="clear"> </div>' +
                '</div>' + nl +
           '</div>' + nl +
        '</div>' + nl +

        '<div id="page">' + nl +
        '<canvas id="world" style="z-index:998; position: absolute; left: 0; top: 0;"><p class="noCanvas">You need a <a href="http://www.google.com/chrome">modern browser</a> to view this.</p></canvas>' +
        '<div id="web-menu">' + nl +
        '<ul>' + nl +
        '<li class="first"><a href="javascript:void(0)" onclick="showInfo(getStart(), 0)"><span class="selected"><img alt="Treehouse" src="content/img/logo-small.png" /></span></a></li>'  + nl +
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


function topPublicAchievementPart(achieverId, currentAchievementId, url, imageUrl, title, publiclyVisible) {
    var titleWithSingleQuotationsEscaped = title.replace(/'/g, '&apos;')
    var titleWithDoubleQuotationsReplacedWithSingle = title.replace(/"/g, "'")
    return (
        '<!DOCTYPE html>' + nl +
            tab + '<html lang="en" xmlns:fb="http://www.facebook.com/2008/fbml">' + nl +
            tab + '<head>' + nl +
            tab + '<title>Treehouse - ' + title + '</title>' + nl +
            tab + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' + nl +
            tab + '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">' + nl +
            tab + '<meta name="apple-mobile-web-app-capable" content="yes">' + nl +
            tab + '<meta name="apple-mobile-web-app-status-bar-style" content="black" />' + nl +
            tab + '<link rel="apple-touch-icon" href="/content/treehouse-icon.png">' + nl +
            tab + '<meta property="og:site_name" content="Treehouse" />' + nl +
            tab + '<meta property="og:title" content="Treehouse: ' + titleWithDoubleQuotationsReplacedWithSingle + '" />' + nl +
            tab + '<meta property="og:type" content="article" />' + nl +
            tab + '<meta property="og:image" content="' + imageUrl + '"/>' + nl +
            tab + '<meta property="og:url" content="http://www.treehouse.io' + url + '"/>' + nl +
            tab + '<link rel="icon" href="/content/favicon.ico" type="image/vnd.microsoft.icon">' + nl +
            tab + '<script> ' + nl +
            tab + '(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){' + nl +
            tab + '(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),' + nl +
            tab + 'm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)' + nl +
            tab + '})(window,document,"script","//www.google-analytics.com/analytics.js","ga");' + nl +
            tab + 'ga("create", "UA-47638344-1", "www.treehouse.io");' + nl +
            tab + 'ga("send", "pageview");' + nl +
            tab + '</script>  ' + nl +
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
            tab + 'insertContent(getPublicAchievementContent(), setDefaultMenu(\'' + titleWithSingleQuotationsEscaped + '\', false), function() {' + nl +
            tab + 'getPublicAchievement(\'' + achieverId + '\',  \'' + currentAchievementId + '\',  \'' + publiclyVisible + '\')' + nl +
            tab + '})' + nl +
            tab + '})' + nl +
            tab + '</script>' + nl +
            tab + '</head>' + nl +
            tab + ' <body onresize="resize_canvas()">' + nl +
            '<div id="fb-root"></div>' + nl +
            '<div id="page">' + nl +
            '<canvas id="world" style="z-index:998; position: absolute; left: 0; top: 0;"><p class="noCanvas">You need a <a href="http://www.google.com/chrome">modern browser</a> to view this.</p></canvas>' +
            '<div id="web-menu">' + nl +
                '<ul>' + nl +
                    '<li class="first"><a href="javascript:void(0)" onclick="showInfo(getStart(), 0)"><span class="selected"><img alt="Treehouse" src="content/img/logo-small.png" /></span></a></li>'  + nl +
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

exports.indexPage = indexPage
exports.publicAchievementPage = publicAchievementPage