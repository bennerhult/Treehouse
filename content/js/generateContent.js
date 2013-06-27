var nl = '\n'

var footerContent = '<ul>' + nl +
    '<li><span><h2>Explore</h2><p>All about sharing & comparing!</p><div><a href="javascript:void(0)" onclick="showInfo(getFeatureInfo(), -1)"><img src="content/img/sharing.jpg"></a></div></span></li>' + nl +
    '<li><span><h2>Achieve</h2><p>In an ever changing world, achievements are forever. Nobody can take your achievements away!<br /><br /><a href="javascript:void(0)" onclick="showInfo(getAchievementInfo(), 1)">Achievements?</a></p></span></li>' + nl +
    '<li><span><h2>Play</h2><p>Let\'s have fun!<br /><br />Get the coveted <a href="javascript:void(0)" onclick="showInfo(getEarlyAdopterInfo(), -1)">Early Adopter Achievement</a></p></span></li>' + nl +
    '<li class="last"><span id="latestAchievementSplash"></span></li>' + nl +
    '</ul>' +
    '<div class="clear"></div>' +
    '<div id="fbLikeWeb" style="overflow:visible;"><div class="fb-like" data-href="http://treehouse.io" data-send="false" data-width="200" data-show-faces="false" font="segoe ui"></div></div>' +
    '<div id="tweetTreehouse">' +
    '<a href="https://twitter.com/share?url=http://treehouse.io&text=Treehouse" class="twitter-share-button">Tweet</a>' +
    '<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>' +
    '</div>'

var isiPad = navigator.userAgent.match(/iPad/i) != null;
var isiPhone = navigator.userAgent.match(/iPhone/i) != null;
var isiOs = isiPad || isiPhone
var currentUserId
var nrOfFriendShipRequests
var isAppMode = false



function init(userId, friendShipRequests) {
    currentUserId = userId
    nrOfFriendShipRequests = friendShipRequests
    FB.init({
        appId: '480961688595420',
        status: true,
        cookie: true,
        xfbml: true,
        channelUrl : '//treehouse.io/channel.html',  //increases performance
        oauth: true
    })
    insertLatestAchievement()
    $("#web-footer").html(footerContent)
    if (isiPad) {
        jQuery(window).bind('orientationchange', function() {
            switch ( window.orientation ) {
                case 0: //Portrait orientation. This is the default value.
                    if ($("#achievementList"))   {
                       // location.reload()
                    }
                    break
                case 180: //Portrait orientation with the screen turned upside down.
                    if ($("#achievementList"))   {
                        //location.reload()
                    }
                    break
            }
        })
    }  else {
        $("#banner").empty().remove()
    }

    if (("standalone" in window.navigator) && window.navigator.standalone){
        isAppMode = true
    }
}

function fixMenu() {
    if (isiPhone){   //TODO eller stående iPade
        $('#menu').addClass('menu-fixed')
    } else {
        $('#menu').addClass('menu-absolute')
    }

}

function setEmptyMenu() {
    var menu = ''
    $("#menuArea").html(menu)
    $("#topMenuArea").html(menu)
    fixMenu()
}

function setDefaultMenu(activePage) {
    var topMenu =  '<div id="topMenu"><ul>'
        +'<li><h2>Achievements</h2></li>'
        +'<li>back</li>'
        +'</ul></div>'

    var menu = '<div id="menu"><ul>'
    menu +='<li><div id="menuIconTree"><a href="javascript:void(0)" onclick="openAchievements(false, \'' + currentUserId + '\', false)"><img src="content/img/homeicon.png" alt="" /></a></div></li>'
    menu +='<li><div id="menuIconFriend"><a href="javascript:void(0)" onclick="openFriends()"><img src="content/img/friendsicon.png" alt="" />'
    if (nrOfFriendShipRequests > 0) {
        menu += '<span>' + nrOfFriendShipRequests + '</span>'
    }
    menu += '</a></div></li>'
    menu +='<li id="menuToggle"><a href="javascript:void(0)" onclick="toggleTab()"><img src="content/img/tree-tab.png" alt=""/></a></li>'
    menu += '</ul></div>' + getTabMenu()
    $("#menuArea").html(menu)
    $("#topMenuArea").html(topMenu)
    fixMenu()
    markActivePage(activePage)
}

function markActivePage(activePage) {
    $('#menuIconFriend').attr("class","")
    $('#menuIconTree').attr("class","")
    switch (activePage) {
        case 'friends' : $('#menuIconFriend').attr("class","selected")
            break
        //case 'user' : $('#menuIconFriend').attr("class","selected")
        //case 'createAchievement' : $('#menuIconTree').attr("class","selected")
        //case 'editAchievement' : $('#menuIconTree').attr("class","selected")
        // case 'achievement' : $('#menuIconTree').attr("class","selected")
        case 'achievements' : $('#menuIconTree').attr("class","selected")
            break
        //case 'notification' : $('#menuIconTree').attr("class","selected")
    }
}
function setPublicMenu() {

    var topMenu =  '<div id="topMenu"><ul>'
        +'<li><h2>Achievements</h2></li>'
        +'<li>back</li>'
        +'</ul></div>'
    var menu = '<div id="menu">' + nl  +
        '<ul>' + nl  +
        '<li class="icons"><a href="javascript:void(0)" onclick="showSignin()"><img src="content/img/signin.png" alt="" /></a></li></ul>' + nl  +
        '</div>' + nl  +
        getTabMenu()
    $("#menuArea").html(menu)
    $("#topMenuArea").html(topMenu)
    fixMenu()
}

function insertContent(content, menuFunction, callback) {
    $("#contentArea").html(content)
    $("#fbLikeWeb").show()
    if (menuFunction) {
        menuFunction()
    }
    if (isiPhone && !isAppMode) {
        $("html, body").animate({scrollTop: 0}, 'fast')
    }
    if (callback) {
        callback()
    }
}

function showSignin(message) {
    window.history.pushState(null, null, "/")
    $("#page").attr("id","page-login");
    $("#app-container").attr("id","app-container-login");
    insertContent(getLoginContent(), setEmptyMenu(), function() {
        $("#message").html(message)
    })
}

function showLatestAchievement(achievementId, userId) {
    window.history.pushState(null, null, "/achievement?achievementId=" + achievementId + "&userId=" + userId)
    insertContent(getPublicAchievementContent(), setPublicMenu(), getPublicAchievement(userId, achievementId))
}

function insertLatestAchievement() {
    $.ajax("/latestAchievementSplash" , {
        type: "GET",
        dataType: "json",
        success: function(content) {
            $("#latestAchievementSplash").html(content

            )
        }, error  : function()     {
            $("#latestAchievementSplash").html('')
        }
    })
}

function getLoginContent() {
    return (
            '<div id="content">' + nl +
                '<div class="signup-logo">' +
                    '<img src="content/img/logo-large.png" />' + nl +
                    '<p>connect below to sign in / sign up</p>' + nl +
                    '<form action="javascript: loginUsingFacebook()">' + nl +
                        '<input type="image" src="content/img/facebook.png" alt="Facebook Connect"/>' + nl +
                    '</form>' + nl +
                '</div>' + nl +
                '<div class="login-separator">' +
                    '<ul>' +
                        '<li><span></span></li>' +
                        '<li>OR</li>' +
                        '<li><span></span></li>' +
                   '</ul>' +
                    '<div class="clear"></div>' + nl +
                '</div>' + nl +
                '<div id="emailForm">' + nl +
                    '<form action="javascript: checkUser(' + isAppMode + ')">' + nl +
                        '<input type="text" class="formstyle" name="username" placeholder="email"">' + nl +
                        '<input type="submit" class="button green" value="Sign in / Sign up">' + nl +
                        '<div id="message"></div>' + nl +
                    '</form>' + nl +
                '</div>' + nl +
            '</div>' + nl
        )
}

function getUserContent(callback) {
    getUserFromServer(function(user) {
        var content = '<div id="content">' + nl +
            '<p>Logged in as: ' + user.username + '</p><br />' + nl +
            '<form action="javascript: editUser()">' + nl
            if (user.firstName) {
                content += '<input type="text" class="formstyle" name="firstName" placeholder="first name" value="' + user.firstName + '">' + nl
            }  else {
                content += '<input type="text" class="formstyle" name="firstName" placeholder="first name">' + nl
            }
            content += '<br /><br />'
            if (user.lastName) {
                content += '<input type="text" class="formstyle" name="lastName" placeholder="last name" value="' + user.lastName + '">' + nl
            }  else {
                content += '<input type="text" class="formstyle" name="lastName" placeholder="last name">' + nl
            }
            content += '<br />'
            content += '<input type="submit" class="button" value="Save">' + nl +
            '</form>' + nl +
            '<div id="message"></div>'  + nl
             if (!user.isIssuer) {
                  content += '<div id="content">' + nl +
                     '<form action="javascript: upgradeToIssuer()">' + nl +
                     '<input type="submit" class="button" value="Upgrade to issuer">' + nl +
                     '</form>' + nl +
                     '<div id="issuerMessage"></div>'  + nl
             }  else {
                 content +=   '<div id="issuerMessage">You are an official Treehouse Issuer of Achievements: <b>' + user.issuerName + '</b></div>'
             }

        content +=   '</div>'
        callback(content)
    })
}

function getUserFromServer(callback) {
    $.ajax("/user", {
        type: "GET",
        dataType: "json",
        statusCode: {
            200: function(user) { callback(user) }
        }
    })
}

function getPrettyNameFromServer(user_id, callback) {
    var data = "user_id=" + user_id

    $.ajax("/prettyName", {
        type: "GET",
        data: data,
        dataType: "json",
        statusCode: {
            200: function(prettyName) { callback(prettyName) }
        }
    })
}

function getFriendsContent(callback) {
    getFriendsList(function(friendsList) {
        var content = '<div id="content">' + nl +
            '<form action="javascript: findFriends()">' + nl +
            '<input type="text" class="formstyle" name="friend_email" placeholder="email">' + nl +
            '<input type="submit" class="button" value="Find friend">' + nl +
            '</form>' + nl +
            '<div id="message"></div>'
        content += friendsList
        content +=   '</div>'
        callback(content)
    })
}

function getFriendsList(callback) {
    getFriendsFromServer(function(friendsList) {
        callback(friendsList)
    })
}

function getSharerList(achievementId, callback) {
    getShareListFromServer(achievementId, function(content) {
          callback(content)
    })
}

function getShareListFromServer(achievementId,callback) {
    var data = "achievementId=" + achievementId

    $.ajax("/shareList", {
        type: "GET",
        data: data,
        dataType: "json",
        statusCode: {
            200: function(shareList) { callback(shareList) }
        }
    })
}


function getCompareList(achievementId, callback) {
    getCompareListFromServer(achievementId, function(content) {
        callback(content)
    })
}

function getCompareListFromServer(achievementId,callback) {
    var data = "achievementId=" + achievementId

    $.ajax("/compareList", {
        type: "GET",
        data: data,
        dataType: "json",
        statusCode: {
            200: function(compareList) { callback(compareList) }
        }
    })
}

function getFriendsFromServer(callback) {
    $.ajax("/friendsList", {
        type: "GET",
        dataType: "json",
        statusCode: {
            200: function(friendsList) { callback(friendsList) }
        }
    })
}

function openFriends() {
    $('#tab-menu').hide('fast')
    getFriendsContent(function(friendsContent) {
        insertContent(friendsContent, setDefaultMenu('friends'))
    })
}

function openUser() {
    $('#tab-menu').hide('fast')
    getUserContent(function(userContent) {
        insertContent(userContent, setDefaultMenu('user'))
    })
}

function progressTab() {
    $('#progressTab').attr("class","selected")
    $('#shareTab').attr("class","")
    $('#compareTab').attr("class","")

    $('#compare-container').hide()
    $('#sharer-container').hide()
    $('#achievement-container').show()
}

function shareTab() {
    $('#progressTab').attr("class","")
    $('#shareTab').attr("class","selected")
    $('#compareTab').attr("class","")

    $('#achievement-container').hide()
    $('#compare-container').hide()
    $('#sharer-container').show()
}

function compareTab() {
    $('#progressTab').attr("class","")
    $('#shareTab').attr("class","")
    $('#compareTab').attr("class","selected")

    $('#achievement-container').hide()
    $('#sharer-container').hide()
    $('#compare-container').show()
}

function getTabMenu() {
   /* var x = getCookie('rememberme')
    var loggedIn = false
    if (x) {
        loggedIn = true
    }*/
    var menu = '<div id="tab-menu" class="slider-menu" style="display:none;">' + nl +
           '<ul>'
    // if (loggedIn) {
         menu +=    '<li class="last"><a href="javascript:void(0)" onclick="signout()"><span>Sign out</span></a></li>'  +  nl +
                    '<li><a href="javascript:void(0)" onclick="openUser()"><span>User</span></a></li>'

     /*}  else {
         menu +=    '<li class="last"><a href="javascript:void(0)" onclick="showSignin()"><span><nobr>Sign in / Sign up</nobr></span></a></li>'
     } */
    menu += '</ul>' + nl +
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

function getAchievementsContent(achieverId, lookingAtFriend, callback) {
    getPrettyNameFromServer(achieverId, function(prettyName) {
        var content =  '<div id="contentwrap"> <div id="userarea"><img src="content/img/user_has_no_image.jpg" /><p>' + prettyName + '</p></div> <div id="achievementListTabs"><a href="javascript:void(0)" onclick="getAchievements(false, \'' + achieverId + '\', ' + lookingAtFriend + ')"><span id="inProgressSpan" class="'
            if  (isiPad || isiPhone) {   //TODO Remove this conditional and css classes, they are identical?
                content+= 'iDevice'
            } else {
                content+= 'hoverDesktop'
            }
        content +=  '">Challenges</span></a>'

        content +=  '<a href="javascript:void(0)" onclick="getAchievements(true, \'' + achieverId + '\', ' + lookingAtFriend + ')"><span id="completedSpan" class="'
            if  (isiPad || isiPhone) {    //TODO Remove this conditional and css classes, they are identical?
                content+= 'iDevice'
            } else {
                content+= 'hoverDesktop'
            }
        content +=  '">Unlocked</span></a></div>'

        content +=  '<div id="achievementList"></div></div>'
        callback(content)
    })
}

function getAchievementContent() {
    return '<div id="achievementDesc"></div>';
}

function getPublicAchievementContent() {
    return (
        '<div id="fb-root"></div>' + nl  +
        '<div id="app-container">' + nl  +
                '<div id="achievementDesc"></div>' + nl  +
        '</div>' + nl
    )
}

//data if edit, null if create
function getNewAchievementContent(data, userId) {
        var text ='<div id="app-container">' + nl  +
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

                        '</div>'
    return text
}