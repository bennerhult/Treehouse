var nl = '\n'

var footerContent = '<ul>' + nl +
    '<li><span><h2>Explore</h2><p>All about sharing and comparing!</p><div><a href="javascript:void(0)" onclick="showInfo(getFeatureInfo(), -1)"><img src="content/img/sharing.jpg"></a></div></span></li>' + nl +
    '<li><span><h2>Achieve</h2><p>In an ever changing world, achievements are forever. Nobody can take your achievements away!<br /><br /><a href="javascript:void(0)" onclick="showInfo(getAchievementInfo(), 1)">Achievements?</a></p></span></li>' + nl +
    '<li><span><h2>Play</h2><p>Let\'s have fun!<br /><br />Get the coveted <a href="javascript:void(0)" onclick="showInfo(getEarlyAdopterInfo(), -1)">Early Adopter Achievement</a></p></span></li>' + nl +
    '<li class="last"><span id="latestAchievementSplash"></span></li>' + nl +
    '</ul>' +
    '<div class="clear"></div>' +
    '<div id="fbLikeWeb" style="overflow:visible;"><div class="fb-like" data-href="http://treehouse.io" data-width="200" font="segoe ui" data-layout="standard" data-action="like" data-show-faces="true" data-share="false"></div></div>' +
    '<div id="fbShare"><a onclick="fbShare(\'Treehouse\', \'http://treehouse.io\', \'content/img/treehouse.jpg\')" href="javascript:void(0)"><span><img src="content/img/f-icon.png"><p>Share</p></span></a></div>' +
    '<div id="tweetTreehouse" style="overflow:visible;">' +
    '<a href="https://twitter.com/share?url=http://treehouse.io&text=Treehouse" class="twitter-share-button">Tweet</a>' +
    '<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>' +
    '</div>'

var isiPad = navigator.userAgent.match(/iPad/i) != null;
var isiPhone = navigator.userAgent.match(/iPhone/i) != null;
var isiOs = isiPad || isiPhone
var currentUser
var nrOfFriendShipRequests
var isAppMode = false


function init(userId, friendShipRequests) {
    if (userId && userId != 'null') {
        getUserFromServer(userId, function(user) {
            currentUser = user
        })
    }
    nrOfFriendShipRequests = friendShipRequests

    FB.init({
        appId: '480961688595420',
        status: true,
        cookie: true,
        xfbml: true,
        channelUrl : '//treehouse.io/channel.html',  //increases performance
        oauth: true
    })

    $("#web-footer").html(footerContent)
    if (isiPad) {
        /*
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
        */
    }  else {
        $("#banner").empty().remove()
    }
    Magnetic.init()
    insertLatestAchievement()

    if (("standalone" in window.navigator) && window.navigator.standalone){
        isAppMode = true
    }
}

function setEmptyMenu() {
    $("#menuArea").empty()
     $("#topMenuArea").empty()
}

function setDefaultMenu(activePage, visitsMainPage) {
    if($('#menuArea').is(':empty')) {
        var menu
        var x = getCookie('rememberme')
        var loggedIn = false
        if (x) {
         loggedIn = true
        }
        var currentUserId
        if (currentUser) {
            currentUserId = currentUser._id
        }
        if (loggedIn) {
            menu = '<div id="menu" class="menu-absolute"><ul>'
            +'<li><div id="menuIconTree" class=""><a href="javascript:void(0)" onclick="openAchievements(false, \'' + currentUserId
            + '\', false)"><img id="menuImageTree" src="content/img/homeicon.png" alt="" /></a></div></li>'
            +'<li><div id="menuIconFriend" class=""><a href="javascript:void(0)" onclick="openFriends()"><img id="menuImageFriends" src="content/img/friendsicon.png" alt="" />'
            if (nrOfFriendShipRequests > 0) {
               menu += '<span id="nrOfFriendShipRequestsAlert">' + nrOfFriendShipRequests + '</span>'
            }
            menu += '</a></div></li>'
            +'<li><div id="menuToggle" class=""><a href="javascript:void(0)" onclick="showMore()"><img id="menuImageTab" src="content/img/tree-tab.png" alt=""/></a></div></li>'
            menu += '</ul></div>'
        } else {
            menu  = '<div id="menu">' + nl  +
            '<ul>' + nl  +
            '<li class="signIn"><a href="javascript:void(0)" onclick="showSignin()"><img src="content/img/signin.png" alt="" /></a></li></ul>' + nl  +
            '</div>'
        }
        $("#menuArea").html(menu)
    }
    setTopMenu(activePage)
    var titleWithoutQuotationsEscaped = activePage.replace(/&apos;/g, '\'')
    $(document).attr('title', 'Treehouse - ' + titleWithoutQuotationsEscaped);
    if (visitsMainPage) {
        switch (activePage) {
            case 'Achievements' :
                $('#menuImageTree').attr('src','content/img/homeicon-selected.png')
                $('#menuIconTree').addClass('selected')
                $('#menuImageFriends').attr('src','content/img/friendsicon.png')
                $('#menuIconFriend').removeClass('selected')
                $('#menuImageTab').attr('src','content/img/tree-tab.png')
                $('#menuToggle').removeClass('selected')
                break
            case 'Friends' :
                $('#menuImageTree').attr('src','content/img/homeicon.png')
                $('#menuIconTree').removeClass('selected')
                $('#menuImageFriends').attr('src','content/img/friendsicon-selected.png')
                $('#menuIconFriend').addClass('selected')
                $('#menuImageTab').attr('src','content/img/tree-tab.png')
                $('#menuToggle').removeClass('selected')
                break
            case 'More' :
                $('#menuImageTree').attr('src','content/img/homeicon.png')
                $('#menuIconTree').removeClass('selected')
                $('#menuImageFriends').attr('src','content/img/friendsicon.png')
                $('#menuIconFriend').removeClass('selected')
                $('#menuImageTab').attr("src","content/img/tree-tab-selected.png")
                $('#menuToggle').addClass('selected')
                break
        }
    }  else {
        $('#menuImageTree').attr('src','content/img/homeicon.png')
        $('#menuIconTree').removeClass('selected')
        $('#menuImageFriends').attr('src','content/img/friendsicon.png')
        $('#menuIconFriend').removeClass('selected')
        $('#menuImageTab').attr('src','content/img/tree-tab.png')
        $('#menuToggle').removeClass('selected')
    }
}

function setTopMenu(title) {
    var topMenu =  '<div id="topMenu"><ul>'
        +'<li><h2>' + title + '</h2></li>'
        +'<li> </li>'
        +'</ul></div>'

    $("#topMenuArea").html(topMenu)
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

function showLatestAchievement(achievementId, userId, title) {
    window.history.pushState(null, null, "/achievement?achievementId=" + achievementId + "&userId=" + userId)
    //if user is not logged in, they have the rounded corner app-container-login
    if (document.getElementById("app-container-login")) {
        $("#app-container-login").attr("id","app-container");
    }
    insertContent(getPublicAchievementContent(), setDefaultMenu(decodeURIComponent(title), false), getPublicAchievement(userId, achievementId, 'true'))
}

function insertLatestAchievement() {
    $.ajax("/latestAchievementSplash" , {
        type: "GET",
        dataType: "json",
        success: function(content) {
            $("#latestAchievementSplash").html(content)
            var els=document.body.getElementsByClassName("latestAchievementLink");
            for(var i=0;i<els.length;i++){
                Magnetic.addFireListener(els[i])
            }
        }, error  : function()     {
            $("#latestAchievementSplash").html('')
        }
    })
}

function getLoginContent() {
    return (
            '<div id="content">' + nl +
                '<div class="signup-logo">' +
                    '<img alt="Treehouse" src="content/img/logo-large.png" />' + nl +
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
    getCurrentUserFromServer(function(user) {
        var content = '<div id="content">' + nl +
            '<div class="changeUserImage"><img id="userImage" src="' + user.imageURL + '" ></div>' +
            '<a href="javascript:void(0)" onclick="uploadUserImage()"><img src="content/img/upload.png" style="margin-top: 8px;"/></a>' + nl +
            '<div class="clear"> </div> <br />' + nl +
            '<h2>Name</h2>' + nl +
            '<form id="userForm" action="javascript: editUser()">' + nl
        if (user.firstName) {
            content += '<input type="text" class="formstyle firstNameForm" name="firstName" placeholder="First name" value="' + user.firstName + '">' + nl
        }  else {
            content += '<input type="text" class="formstyle firstNameForm" name="firstName" placeholder="First name">' + nl
        }

        if (user.lastName) {
            content += '<input type="text" class="formstyle lastNameForm" name="lastName" placeholder="Last name" value="' + user.lastName + '">' + nl
        }  else {
            content += '<input type="text" class="formstyle lastNameForm" name="lastName" placeholder="Last name">' + nl
        }
        content += '<br /><br /><h2>Email</h2><p> ' + user.username + '</p>'
        content += '<input type="submit" class="button" value="Save">' + nl +
            '</form>' + nl +
            '<p id="message"></p>'  + nl +
            '<div class="separerare"> </div> <h2>Issuer</h2> <p>Want to create achievements available for all? Apply by clicking below.</p>' + nl
        if (!user.isIssuer) {
            content += '<div>' + nl +
                '<form id="issuerForm" action="javascript: upgradeToIssuer()">' + nl +
                '<input type="submit" class="button" value="Upgrade to issuer">' + nl +
                '</form>' + nl +
                '<p id="issuerMessage"></p>'  + nl
        }  else {
            content +=   '<div id="issuerMessage">You are an official Treehouse Issuer of Achievements: <b>' + user.issuerName + '</b></div>'
        }

        content +=   '</div>'
        callback(content)
    })
}

function getUserFromServer(user_id, callback) {
    var data = "user_id=" + user_id
    $.ajax("/user", {
        type: "GET",
        data: data,
        dataType: "json",
        statusCode: {
            200: function(user) { callback(user) }
        }
    })
}

function getCurrentUserFromServer(callback) {
    $.ajax("/currentUser", {
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
            '<input type="submit" class="button" value="Search">' + nl +
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
    window.history.pushState(null, null, "/")
    getFriendsContent(function(friendsContent) {
        insertContent(friendsContent, setDefaultMenu('Friends', true))
    })
}

function openUser() {
    getUserContent(function(userContent) {
        insertContent(userContent, setDefaultMenu('User', false))
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

function getAchievementsContent(achiever, lookingAtFriend, callback) {
    getPrettyNameFromServer(achiever._id, function(prettyName) {
        var content =  '<div id="contentwrap"> <div id="userarea"><img src="' + achiever.imageURL + '" /><p>' + prettyName + '</p></div> <div id="achievementListTabs"><a href="javascript:void(0)" onclick="getAchievements(false, \'' + achiever._id + '\', ' + lookingAtFriend + ')"><span id="inProgressSpan" class="hoverDesktop">Challenges</span></a>'

        content +=  '<a href="javascript:void(0)" onclick="getAchievements(true, \'' + achiever._id + '\', ' + lookingAtFriend + ')"><span id="completedSpan" class="hoverDesktop">Unlocked</span></a></div>'

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

function getMoreMenuContent(callback) {
    callback(
        '<div id="moreList">' +
            '<ul>' +

                 '<li><a href="javascript:void(0)" onclick="openUser()"><img src="content/img/user.png" ></a></li>' +
                  '<li><a href="javascript:void(0)" onclick="signout()"><img src="content/img/logout.png" ></a></li>' +

            '</ul>' +
        '</div>')

}

//data if edit, null if create
function getNewAchievementContent(data, achieverId) {
    var titleWithQuotationsEscaped = ""
    if (data && data.title)  {
        titleWithQuotationsEscaped = data.title.replace(/"/g, '&quot;')
    }

    initImages()
        var text ='<div id="app-container">' + nl  +
                '<form id="createAchievementForm" action="javascript: createAchievement(\'' + achieverId + '\')">' + nl  +
                    '<div class="achievement-info">' + nl  +
            '<div class="inputarea">' + nl  +
                            '<input type="text" class="formstyle" name="title" placeholder="title" onblur="showMenu()" onfocus="hideMenu()" '
                                    if (data)  {
                                        text +=  'value="' + titleWithQuotationsEscaped + '"'
                                    }
                               text += '>' + nl  +
                            '<textarea class="formstyle" name="description" placeholder="description"  onblur="showMenu()" onfocus="hideMenu()" >'
                                    if (data)  {
                                        text +=   data.description
                                    }
                                    text += '</textarea>' + nl  +
                        '</div>' + nl  +
                        '<div class="imagearea-container">' + nl  +
                            '<div class="create-imagearea">' + nl  +
                            '<img id="achievementImage" src="'
                                if (data)  {
                                    text +=   data.imageURL  + '" width="96" height="96" alt="' + data.title + '" />' + nl
                                } else {
                                    text +=   'content/img/achievementImages/1.png" width="96" height="96" alt="" />' + nl
                                }
                         text += '<span class="gradient-bg"></span>' + nl  +
                        '</div>' + nl  +
                        '<div id="fileinputs" class="fileinputs">' + nl  +
                            '<ul>' + nl  +
                                '<li><a href="javascript:void(0)" onclick="toggleImage(-1)"><img src="content/img/left-arrow.png" alt="" /></a></li>' + nl  +
                                '<li class="last"><a href="javascript:void(0)" onclick="toggleImage(1)"><img src="content/img/right-arrow.png" alt="" /></a></li>' + nl  +
                            '</ul>' + nl  +
                        '</div><div id="fileupload" class="fileupload">' + nl  +
                                '<a href="javascript:void(0)" onclick="uploadImage()"><img src="content/img/upload.png" /></a>' + nl  +
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
                                    text +='<tr><td class="goal"><input type="text" class="formstyle" name="goalTitle' + orderNr + '" placeholder="goal" onblur="showMenu()" onfocus="hideMenu()" onkeypress="goalKeyPress(this)" onpaste="goalKeyPress(this)"'
                                    text +=  'value="' + data.goals[i].title + '"'
                                    text += '></td><td class="quantity"><input type="text" class="formstyle" name="goalQuantity' + orderNr + '" placeholder="1" onblur="showMenu()" onfocus="hideMenu()"  id="goalQuantity' + orderNr + '" '
                                    text +=  'value="' + data.goals[i].quantityTotal + '"'
                                    text +='></td></tr>'
                                }
                                orderNr++
                                text +='<tr><td class="goal"><input type="text" class="formstyle" name="goalTitle' + orderNr + '" placeholder="goal" onblur="showMenu()" onfocus="hideMenu()" onkeypress="goalKeyPress(this)" onpaste="goalKeyPress(this)"></td><td class="quantity"><input type="text" class="formstyle" id="goalQuantity' + orderNr + '" placeholder="1" onblur="showMenu()" onfocus="hideMenu()" name="goalQuantity' + orderNr + '"></td></tr>'

                            } else {
                                text += '<tr><td class="goal"><input type="text" class="formstyle" name="goalTitle1" placeholder="goal" onblur="showMenu()" onfocus="hideMenu()" onkeypress="goalKeyPress(this)" onpaste="goalKeyPress(this)"></td><td class="quantity"><input type="text" class="formstyle" id="goalQuantity1" placeholder="1" onblur="showMenu()" onfocus="hideMenu()"  name="goalQuantity1"></td></tr>'
                            }
                        text += '</table>' + nl  +
                        '<div class="clear"></div>' + nl  +
                    '</div>' + nl  +
                '</div>' + nl  +
                ' <div class="create-achievement">' + nl
                    if (data) {
                        text += '<input type="submit" id="saveButton" class="button" value="Save achievement">' + nl
                    }  else  {
                        text += '<input type="submit" id="saveButton" class="button" value="Create achievement">' + nl
                    }
                     text += '<div id="message"></div>' + nl +
                            '</div>' + nl  +
                        '</form>' + nl  +
                    '</div>'
    return text
}