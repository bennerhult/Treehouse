var nl = '\n'

var footerContent = '<ul>' + nl +
    '<li><span><h2>Explore</h2><p>All about sharing & comparing!</p><div><a href="javascript:void(0)" onclick="showInfo(getFeatureInfo(), -1)"><img src="content/img/sharing.jpg"></a></div></span></li>' + nl +
    '<li><span><h2>Achieve</h2><p>In an ever changing world, achievements are forever. Nobody can take your achievements away!<br /><br /><a href="javascript:void(0)" onclick="showInfo(getAchievementInfo(), 1)">Achievements?</a></p></span></li>' + nl +
    '<li><span><h2>Play</h2><p>Let\'s have fun!<br /><br />Get the coveted <a href="javascript:void(0)" onclick="showInfo(getEarlyAdopterInfo(), -1)">Early Adopter Achievement</a></p></span></li>' + nl +
    '<li class="last"><span id="latestAchievementSplash"></span></li>' + nl +
    '</ul>' +
    '<div class="clear"></div>' +
    '<div id="fbLikeWeb" style="overflow:visible;"><div class="fb-like" data-send="false" data-width="250" data-show-faces="true" font="segoe ui"></div></div>' +
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
                        location.reload()
                    }
                    break
                case 180: //Portrait orientation with the screen turned upside down.
                    if ($("#achievementList"))   {
                        location.reload()
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
    if (isiPhone){
        $('#menu').addClass('menu-fixed')
        //$('#menuArea').addClass('menu-area-fixed')
    } else {
        $('#menu').addClass('menu-absolute')
    }
}

function setPublicMenu(nrOfFriendRequests) {
    var menu = '<div id="menu">' + nl  +
        '<ul>' + nl  +
        '<li id="house"><a href="javascript:void(0)" onclick="toggleTab()"><img src="content/img/tree-tab.png" alt=""/></a></li>' +
        '</ul>' + nl  +
        '</div>' + nl  +
        getTabMenu(0)
    $("#menuArea").html(menu)
    fixMenu()
 }

function setCreateEditMenu(achievement) {
    var text ='<div id="menu">' + nl  +
        '<ul>' + nl  +
        '<li class="back"><a href="javascript:void(0)" onclick="'
    if (achievement) {
        text += 'openAchievement(\'' + achievement._id + '\',\'' + currentUserId + '\', ' + false + ', ' +  false + ', ' + false + ', ' + false + ', ' + false+ ', ' + true + ')'
    } else {
        text += 'openAchievements(false, \'' + currentUserId + '\', false)'
    }
    text+='"><img src="content/img/back-1.png" alt=""/></a></li>' + nl  +
        '</ul>' + nl  +
        '</div>'
    $("#menuArea").html(text)
    fixMenu()
}

function setDefaultMenu(bothCompletedAndNotExists, lookingAtFriend, achieverId) {
    var menu = '<div id="menu"><ul><li  id="inProgress">'
    if (bothCompletedAndNotExists) {
        menu +=  '<a href="javascript:void(0)" onclick="getAchievements(false, \'' + achieverId + '\', ' + lookingAtFriend + ')"><span id="inProgressSpan" class="'
        if  (isiPad || isiPhone) {   //TODO Remove this conditional and css classes, they are identical?
            menu+= 'iDevice'
        } else {
            menu+= 'hoverDesktop'
        }
        menu +=  '">in progress</span></a>'
    }
    menu += '</li><li id="menuToggle"><a href="javascript:void(0)" onclick="toggleTab()"><img src="content/img/tree-tab.png" alt=""/></a></li><li id="completed">'
    if (bothCompletedAndNotExists) {
        menu +=  '<a href="javascript:void(0)" onclick="getAchievements(true, \'' + achieverId + '\', ' + lookingAtFriend + ')"><span id="completedSpan" class="'
        if  (isiPad || isiPhone) {    //TODO Remove this conditional and css classes, they are identical?
            menu+= 'iDevice'
        } else {
            menu+= 'hoverDesktop'
        }
        menu +=  '">completed</span></a>'
    }
    menu +=  '</li></ul></div>' + getTabMenu()
    $("#menuArea").html(menu)
    fixMenu()
}

function setAchievementMenu(currentAchievementId, publiclyVisible, progressMade, completed, achieverId, lookingAtFriend, lookingAtNotification, sharedAchievement, isAchievementCreatedByMe) {
    var menu = '<div id="menu"><ul><li class="back"><a href="javascript:void(0)" onclick="openAchievements(' + completed + ', \'' + achieverId + '\', ' + lookingAtFriend + ')"><img src="content/img/back-1.png" alt=""/></a></li>'

    if (!lookingAtFriend && !lookingAtNotification) {
        menu += '<li id="deleteButton" class="add"><a href="javascript:void(0)" onclick="deleteAchievement()"><img src="content/img/delete.png" /></a></li>'
        menu += '<li id="publicizeButton" class="share"><a href="javascript:void(0)" onclick="publicize()"><img src="content/img/publicize.png" /></a></li>'
        menu += '<li id="unpublicizeButton" class="share"><a href="javascript:void(0)" onclick="unpublicize()"><img src="content/img/unpublicize.png" /></a></li>'
        if (!progressMade && !sharedAchievement) { menu += '<li id="editButton" class="edit"><a href="javascript:void(0)" onclick="editAchievement(\'' + achieverId + '\')"><img src="content/img/edit.png" /></a></li>'}
    }  else if (lookingAtNotification && !lookingAtFriend) {
        menu += '<li class="add"><a style="color:black" href="javascript:void(0)" onclick="confirmAchievement(\'' + currentAchievementId + '\', \'' + achieverId + '\')"><img src="content/img/challengeaccepted.png" alt="challenge accepted" /></a></li><li class="share"> <a style="color:black" href="javascript:void(0)" onclick="ignoreAchievement(\'' + currentAchievementId + '\', \'' + achieverId + '\')"><img src="content/img/ignore.png" alt="Ignore" /></a></li>'
    }

    menu += '</ul></div>'
    $("#menuArea").html(menu)
    fixMenu()

    if (!lookingAtFriend && !lookingAtNotification) {
        if (!publiclyVisible) {
            $("#unpublicizeButton").hide()
        } else {
            $("#publicizeButton").hide()
            $("#editButton").hide()

        }
    }
    if (  isAchievementCreatedByMe) {
        $("#editButton").hide()
    }
}

function setEmptyMenu() {
    var menu = ''
    $("#menuArea").html(menu)
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
    insertContent(getPublicAchievementContent(), setPublicMenu(0), getPublicAchievement(userId, achievementId))
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
                        '<div id="message"></div>' + nl +
                        '<input type="submit" class="button green" value="Sign in / Sign up">' + nl +
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
            '<div id="message"></div>'
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
        insertContent(friendsContent, setDefaultMenu(false, false, currentUserId))
    })
}

function openUser() {
    $('#tab-menu').hide('fast')
    getUserContent(function(userContent) {
        insertContent(userContent, setDefaultMenu(false, false, currentUserId))
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
    var x = getCookie('rememberme')
    var loggedIn = false
    if (x) {
        loggedIn = true
    }
    var menu = '<div id="tab-menu" class="slider-menu" style="display:none;">' + nl +
           '<ul>'
     if (loggedIn) {
         menu +=    '<li class="header border-top-right">Achievements</li>' + nl +
                    '<li><a href="javascript:void(0)" onclick="openAchievements(false, \'' + currentUserId + '\', false)"><span><nobr>My achievements</nobr></span></a></li>'+ nl +
                    '<li class="header">Friends</li>' + nl +
                    '<li id="friendRequestRow"><a href="javascript:void(0)" onclick="openFriends()"><span>Friends'
         if (nrOfFriendShipRequests > 0) {
             menu += ' (' + nrOfFriendShipRequests + ')'
         }
         menu +=    '</span></a></li>' + nl +
                    '<li class="header">Account</li>' + nl +
                    '<li><a href="javascript:void(0)" onclick="openUser()"><span>User</span></a></li>' +  nl +
                    '<li class="last"><a href="javascript:void(0)" onclick="signout()"><span class="border-bottom-right">Sign out</span></a></li>'
     }  else {
         menu +=    '<li class="header">Account</li>' + nl +
                    '<li class="last"><a href="javascript:void(0)" onclick="showSignin()"><span class="border-bottom-right"><nobr>Sign in / Sign up</nobr></span></a></li>'
     }
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

function getAchievementsContent() {
    return '<div id="achievementList"></div>'
}

function getAchievementContent() {
    var achievementContent =
        '<div id="app-container">' + nl  +
            '<div id="achievementDesc"></div>' + nl  +
        '</div>' + nl;
    return achievementContent;
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