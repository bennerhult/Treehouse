var nl = '\n'

var footerContent = '<ul>' + nl +
    '<li><span><h2>Explore</h2><p>Learn more about sharing!</p><div><a href="javascript:void(0)" onclick="showInfo(getFeatureInfo(), -1)"><img src="content/img/sharing.jpg"></a></div></span></li>' + nl +
    '<li><span><h2>Achieve</h2><p>In an ever changing world, achievements are forever. Nobody can take your achievements away!<br /><br /><a href="javascript:void(0)" onclick="showInfo(getAchievementInfo(), 1)">Achievements?</a></p></span></li>' + nl +
    '<li><span><h2>Play</h2><p>Let\'s have fun!<br /><br />Get the coveted <a href="javascript:void(0)" onclick="showInfo(getEarlyAdopterInfo(), -1)">Early Adopter Achievement</a></p></span></li>' + nl +
    '<li class="last"><span id="latestAchievementSplash"></span></li>' + nl +
    '</ul>' +
    '<div id="fbLikeWeb" style="overflow:visible;"><div class="fb-like" data-send="false" data-width="250" data-show-faces="true" font="segoe ui"></div></div>'

var isiPad = navigator.userAgent.match(/iPad/i) != null;

function resizeMenu() {
    if ($(document).width() > 999)   {
        $("#inProgressOrCompletedMenu").css("top", 264 - $(window).scrollTop())
        $("#inProgressOrCompletedMenu").css("width", 370 - $(window).scrollLeft())

    } else if (document.width > 799) {
            $("#inProgressOrCompletedMenu").css("top", 80  - $(window).scrollTop())
            $("#inProgressOrCompletedMenu").css("width", 370 - $(window).scrollLeft())
    } else {
        $("#inProgressOrCompletedMenu").css("top", "0")
        $("#inProgressOrCompletedMenu").css("width", "100%")
    }
}

function insertContent(content, callback, achievementId, userId, publicView) {
    $("#contentArea").html(content)
    $("#web-footer").html(footerContent)
    FB.init({status: true, cookie: true, xfbml: true})
    $("#fbLikeWeb").show()
    if (!isiPad) {
        document.addEventListener("touchmove", resizeMenu, false);
        document.addEventListener("scroll", resizeMenu, false);
        $("#banner").empty().remove()
    }
    insertLatestAchievement()
    /*if (window.innerWidth < 819) {
        $("html, body").animate({scrollTop: $("#menu").offset().top}, 200)
    }*/
    resizeMenu()

    if (callback) {
        callback(achievementId, userId, publicView)
    }
}

function showLatestAchievement(achievementId) {
    window.history.pushState(null, null, "/achievement?achievementId=" + achievementId)
    insertContent(getPublicAchievementContent(), function() {
        getPublicAchievement(achievementId, null, true)
    }, achievementId, null, true)
}

function insertLatestAchievement() {
    $.ajax("/latestAchievementSplash" , {
        type: "GET",
        dataType: "json",
        success: function(achievement) {
            $("#latestAchievementSplash").html(
                '<h2>Latest Achievement</h2>' +
                '<p><a href="javascript:void(0)" onclick="showLatestAchievement(\'' + achievement._id + '\')">' + achievement.title + '</a></p>' +
                '<div><a href="javascript:void(0)" onclick="showLatestAchievement(\'' + achievement._id + '\')"><img src="' + achievement.imageURL + '" /></a></div>'
                )
        }, error  : function()     {
            $("#latestAchievementSplash").html('')
        }
    })
}

function getLoginContent() {
    return (
            '<div id="menu"></div>' + nl +
            '<div id="content">' + nl +
                '<div class="signup-logo"><img src="content/img/logo-large.png" /></div>' + nl +
                '<form action="javascript: checkUser()">' + nl +
                    '<input type="text" class="formstyle" name="username" placeholder="email"">' + nl +
                    '<span id="passwordSpan">' + nl +
                        '<input type="password" class="formstyle" name="password" placeholder="password">' + nl +
                    '</span>' + nl +
                    '<div id="message"></div>' + nl +
                    '<input type="submit" class="button green" value="Log in">' + nl +

                '</form>' + nl +
                '<div class="log-in-text"><a href="javascript:void(0)" onclick="insertContent(getSignupContent())">Don\'t have an account? Sign up. It\'s free.</a></div>' + nl +
            '</div>' + nl
        )
}

function getSignupContent() {
    return (
            '<div id="menu"></div>' + nl +
            '<div id="content">' + nl +
                '<div class="signup-logo"><img src="content/img/logo-large.png" /></div>' + nl +
                '<h1 class="signup">Sign Up</h1>' + nl +
                '<form action="javascript: signup()">' + nl +
                    '<input type="text" class="formstyle" name="username" placeholder="email">' + nl +
                    '<input type="password" class="formstyle" name="password" placeholder="password">' + nl +
                    '<div id="message"></div>' + nl +
                    '<input type="submit" class="button" value="Create my account">' + nl +
                '</form>' + nl +
                '<div class="log-in-text"><a href="javascript:void(0)" onclick="insertContent(getLoginContent())">Already awesome? Log in.</a></div>' + nl +
            '</div>' + nl
        )
}

function getFriendsContent() {
    var friendsContent = '<div id="menu">' + nl  +
        '<ul>' + nl  +
        '<li class="house"><a href="javascript:void(0)" onclick="toggleTab()"><img src="content/img/tree-tab.png" alt=""/></a></li>' +
        '</ul>' + nl  +
        '</div>' + nl
    friendsContent += getTabMenu(false)
    friendsContent += '<div id="content">' + nl +
            '<form action="javascript: findFriends()">' + nl +
            '<input type="text" class="formstyle" name="friend_email" placeholder="email">' + nl +
            '<input type="submit" class="button" value="Find friend">' + nl +
            '</form>' + nl +
            '<div id="message"></div>' + nl +
            '</div>'
     return friendsContent
}

function getTabMenu(bothCompletedAndNotExists) {
    var x = getCookie('rememberme')
    var loggedIn = false
    if (x) {
        loggedIn = true
    }
    var menu = '<div class="tab-menu-container">' + nl +
           '<div id="tab-menu" class="slider-menu" style="display:none;">' + nl +
           '<ul>'
     if (loggedIn) {
         menu +=    '<li class="header border-top-right">Achievements</li>' + nl +
                    '<li><a href="javascript:void(0)" onclick="insertContent(getAchievementsContent(' + bothCompletedAndNotExists + '), openAchievements(false))"><span><nobr>My achievements</nobr></span></a></li>'+ nl +
                    '<li class="header">Friends</li>' + nl +
                    '<li><a href="javascript:void(0)" onclick="insertContent(getFriendsContent())"><span>Friends</span></a></li>' + nl +
                    '<li class="header">Account</li>' + nl +
                    '<li class="last"><a href="javascript:void(0)" onclick="logout()"><span class="border-bottom-right">Log out</span></a></li>'
     }  else {
         menu +=    '<li class="header">Account</li>' + nl +
                    '<li class="last"><a href="javascript:void(0)" onclick="insertContent(getLoginContent())"><span class="border-bottom-right"><nobr>Log in / sign up</nobr></span></a></li>'
     }
    menu += '</ul>' + nl +
            '</div>' + nl +
            '</div>' + nl
    return menu
}

function getCookie(c_name) {
    var i,x,y,ARRcookies=document.cookie.split(";")
    for (i=0;i<ARRcookies.length;i++) {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="))
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1)
        x=x.replace(/^\s+|\s+$/g,"")
        if (x==c_name) {
            return unescape(y)
        }
    }
}

function getAchievementsContent(bothCompletedAndNotExists) {
    var achievementsContent ='<div id="content no-padding"><div id="inProgressOrCompletedMenu"><ul>'
    if (bothCompletedAndNotExists) {
        achievementsContent +=  '<li id="inProgress"><a href="javascript:void(0)" onclick="getAchievements(false)"><span>in progress</span></a></li>'
    }
    achievementsContent += '<li><a href="javascript:void(0)" onclick="toggleTab()"><img src="content/img/tree-tab.png" alt=""/></a></li>'
    if (bothCompletedAndNotExists) {
        achievementsContent +=  '<li id="completed"><a href="javascript:void(0)" onclick="getAchievements(true)"><span>completed</span></a></li>'
    }
    achievementsContent +=  '</ul></div>' + getTabMenu(bothCompletedAndNotExists) + '<div id="achievementList"></div></div>'
    return achievementsContent
}

function getAchievementContent(publiclyVisible, progressMade, isLatestAchievement, completed, userId) {
    var achievementContent =
        '<div id="app-container">' + nl  +
        '<div id="content no-padding">' + nl  +
        '<div id="menu">' + nl  +
        '<ul>' + nl  +
        '<li class="back"><a href="javascript:void(0)" onclick="openAchievements(' + completed + ')"><img src="content/img/back-1.png" alt=""/></a></li>' + nl
    if (!isLatestAchievement) { achievementContent += '<li id="deleteButton" class="add"><a href="javascript:void(0)" onclick="deleteAchievement()"><img src="content/img/delete.png" /></a></li>' + nl }

        if (!publiclyVisible) { achievementContent += '<li id="publicizeButton" class="share"><a href="javascript:void(0)" onclick="publicize()"><img src="content/img/share.png" /></a></li>' }
    if (!publiclyVisible && !progressMade) { achievementContent += '<li id="editButton" class="edit"><a href="javascript:void(0)" onclick="editAchievement(\'' + userId + '\')"><img src="content/img/edit.png" /></a></li>' + nl }
         achievementContent += '</ul>' + nl  +
            '</div>' + nl  +
            '<div id="achievementDesc"></div>' + nl  +
            '</div>' + nl +
            '</div>' + nl;
    return achievementContent;
}

function getPublicAchievementContent() {
    return (
        '<div id="fb-root"></div>' + nl  +
        '<div id="app-container">' + nl  +
            '<div id="content no-padding">' + nl  +
                '<div id="menu">' + nl  +
                    '<ul>' + nl  +
                        '<li class="house"><a href="javascript:void(0)" onclick="toggleTab()"><img src="content/img/tree-tab.png" alt=""/></a></li>' +
                    '</ul>' + nl  +
                '</div>' + nl  +
                    getTabMenu(false) +
                '<div id="achievementDesc"></div>' + nl  +
            '</div>' + nl +
        '</div>' + nl
    )
}

//data if edit, null if create
function getNewAchievementContent(data, userId) {
        var text ='<div id="app-container">' + nl  +
            '<div id="content no-padding">' + nl  +
                '<div id="menu">' + nl  +
                    '<ul>' + nl  +
                        '<li class="back"><a href="javascript:void(0)" onclick="'
                        if (data) {
                            text += 'openAchievement(\'' + data._id + '\', \'' + userId + '\', ' + false + ', ' +  false + ', ' + false +')'
                        } else {
                            text += 'openAchievements(false)'
                        }
                        text+='"><img src="content/img/back-1.png" alt=""/></a></li>' + nl  +
                    '</ul>' + nl  +
                '</div>' + nl  +
                '<form id="createAchievementForm" action="javascript: createAchievement()">' + nl  +
                    '<div class="achievement-info">' + nl  +
                        '<div class="inputarea">' + nl  +
                            '<input type="text" class="formstyle" name="title" placeholder="title"'
                                    if (data)  {
                                        text +=  'value="' + data.title + '"'
                                    }
                               text += '>' + nl  +
                            '<textarea class="formstyle" name="description" placeholder="description">'
                                    if (data)  {
                                        text +=   data.description
                                    }
                                    text += '</textarea>' + nl  +
                        '</div>' + nl  +
                        '<div class="imagearea-container">' + nl  +
                            '<div class="create-imagearea">' + nl  +
                            '<img id="achievementImage" src="'
                                if (data)  {
                                    text +=   data.imageURL
                                } else {
                                    text +=   'content/img/achievementImages/1.png'
                                }
                            text +='" alt="" />' + nl  +
                            '<span class="gradient-bg"></span>' + nl  +
                        '</div>' + nl  +
                        '<div class="fileinputs">' + nl  +
                            '<ul>' + nl  +
                                '<li><a href="javascript:void(0)" onclick="toggleImage(-1)"><img src="content/img/left-arrow.png" alt="" /></a></li>' + nl  +
                                '<li class="last"><a href="javascript:void(0)" onclick="toggleImage(1)"><img src="content/img/right-arrow.png" alt="" /></a></li>' + nl  +
                            '</ul>' + nl  +
                        '</div>' + nl  +
                    '</div>' + nl  +
                    '<div class="clear"></div>' + nl  +
                '</div>' + nl  +
                '<div id="achievement-container">' + nl  +
                    '<div class="part-achievement">' + nl  +
                        '<table id="goalTable">' + nl
                            if (data) {
                                var orderNr
                                for (var i in data.goals) {
                                    orderNr = i*1 + 1  //*1 to force numeric, not string
                                    text +='<tr><td class="goal"><input type="text" class="formstyle" name="goalTitle' + orderNr + '" placeholder="goal" onkeypress="goalKeyPress(this)" onpaste="goalKeyPress(this)"'
                                    text +=  'value="' + data.goals[i].title + '"'
                                    text += '></td><td class="quantity"><input type="text" class="formstyle" name="goalQuantity' + orderNr + '" placeholder="1" id="goalQuantity' + orderNr + '" '
                                    text +=  'value="' + data.goals[i].quantityTotal + '"'
                                    text +='></td></tr>'
                                }
                                orderNr++
                                text +='<tr><td class="goal"><input type="text" class="formstyle" name="goalTitle' + orderNr + '" placeholder="goal" onkeypress="goalKeyPress(this)" onpaste="goalKeyPress(this)"></td><td class="quantity"><input type="text" class="formstyle" id="goalQuantity' + orderNr + '" placeholder="1" name="goalQuantity' + orderNr + '"></td></tr>'

                            } else {
                                text += '<tr><td class="goal"><input type="text" class="formstyle" name="goalTitle1" placeholder="goal" onkeypress="goalKeyPress(this)" onpaste="goalKeyPress(this)"></td><td class="quantity"><input type="text" class="formstyle" id="goalQuantity1" placeholder="1" name="goalQuantity1"></td></tr>'
                            }
                        text += '</table>' + nl  +
                        '<div class="clear"></div>' + nl  +
                    '</div>' + nl  +
                '</div>' + nl  +
                ' <div class="create-achievement">' + nl
                    if (data) {
                        text += '<input type="submit" class="button" value="Save achievement">' + nl
                    }  else  {
                        text += '<input type="submit" class="button" value="Create achievement">' + nl
                    }
                     text += '<div id="message"></div>' + nl +
                            '</div>' + nl  +
                            '</form>' + nl  +
                            '</div>' + nl  +
                        '</div>'
    return text
}