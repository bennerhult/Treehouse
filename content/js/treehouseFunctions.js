/******************  login functions  ******************/
function checkUser(appMode) {
    var username = $("input[name=username]").val()
    if (username) {
        if (username.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i)) {
            checkUserOnServer(username, appMode,
                function(data) {
                    if (data == "existing user") {
                        $("#emailForm").html('We just sent you the old Treehouse email. Fetch email. Click link!')
                    } else if (data == "new user") {
                        $("#emailForm").html('We just sent you an email. Therein lies a link. Click it and you shall enter!')
                    } else {
                        $("#message").html(data)
                    }
                }
            )
        } else {
            $("#message").html("Sadly, we can only email to <i>real</i> addresses.")
        }
    } else {
        $("#message").html("First law of Treehouse: First you type, then you press.")
    }
}

function checkUserOnServer(username, appMode, callback) {
    var data = "username=" + username + "&appMode=" + appMode
    $.ajax("/checkUser", {     
        type: "GET",
        data: data,
        dataType: "json",
        success: function(data) { if ( callback ) callback(data) },
        error  : function()     { if ( callback ) callback(null) }
    })
}


function loginUsingFacebook() {
    if (isAppMode || isiOs) {
        window.location = "https://m.facebook.com/dialog/oauth?client_id=480961688595420&response_type=code&redirect_uri=http://treehouse.io/fbAppConnect&scope=email"
    } else {
        FB.login(function(response) {
            if (response.authResponse) {
                FB.api('/me', function(apiResponse) {
                    if (apiResponse) {
                        checkFBUserOnServer(apiResponse.email,
                            function(nrOfRequests, ok) {
                                nrOfFriendShipRequests = nrOfRequests
                                if (ok) { //TODO: use ajax success/error instead
                                    openAchievements(false, currentUserId, false)
                                } else {
                                    $("#message").html("Facebook did not play nice. Try regular login instead.")
                                }
                            }
                        )
                    } else {
                        $("#message").html('Facebook did not play nice! Try regular login instead.')
                    }
                })
            } else {
                $("#message").html('No worries! Try regular login instead.')   //the user closed the fb-login dialogue
            }
        }, {scope: 'email'})
    }

}

function checkFBUserOnServer(username, callback) {
    var data = "username=" + username
    $.ajax("/checkFBUser", {
        type: "GET",
        data: data,
        dataType: "json",
        statusCode: {
            200: function(returnData) { callback(returnData, true) },
            404: function() { callback(jqxhr.responseText , false) }
        }
    })
}

function rememberMe() {
    rememberMeOnServer(
        function(nrOfRequests, ok) {
            if (ok) { //TODO: use ajax success/error instead
                nrOfFriendShipRequests = nrOfRequests
                openAchievements(false, currentUserId, false)
            } else {
                showSignin()
            }
        }
    )
}

function rememberMeOnServer(callback) {
    $.ajax("/rememberMe", {
        type: "GET",
        dataType: "json",
        statusCode: {
            200: function(returnData) { callback(returnData, true) },
            404: function() { callback("", false) }
        }
    })
}

/******************  sign out functions  ******************/
function signout() {
    logOutFB()

    $.ajax("/signout", {
        type: "GET",
        dataType: "json",
        success: function() { showSignin() },
        error  : function() { showSignin() }

    })
}

function logOutFB() {    //TODO: do not log out the user from FB, just from the Treehouse-FB-app
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            FB.logout()
            logOutFB()
        } else if (response.status === 'not_authorized') {
            FB.logout()
            logOutFB()
        }
    }, true)
}

/******************  user functions  ******************/
function editUser() {
    var firstName = $("input[name=firstName]").val()
    var lastName = $("input[name=lastName]").val()

    setPrettyNameOnServer(firstName, lastName, function(success) {
        $("#message").html("Changes saved!")
    })
}

function setPrettyNameOnServer(firstName, lastName, callback) {
    var data = "firstName=" + firstName + "&lastName=" + lastName
    $.ajax("/setPrettyName", {
        type: "GET",
        data: data,
        dataType: "json",
        statusCode: {
            200: function() { callback(true) },
            404: function() { callback(false) }
        }
    })
}

function upgradeToIssuer() {
    upgradeToIssuerOnServer(function(success) {
        if (success) {
            $("#issuerMessage").html("Your request has been sent and the happy people in Treehouse HQ will get back to you. We know your email.")
        }   else {
            $("#issuerMessage").html("Oopsie, we dropped your request. Sorry! Email us at <a href='mailto:staff@treehouse.io'>staff@treehouse.io</a> and we will sort it out for you.")
        }
    })
}

function upgradeToIssuerOnServer(callback) {
    $.ajax("/upgradeToIssuer", {
        type: "GET",
        dataType: "json",
        statusCode: {
            200: function() { callback(true) },
            404: function() { callback(false) }
        }
    })
}
/******************  friends functions  ******************/
function findFriends() {
    var friend_email = $("input[name=friend_email]").val()
    if (friend_email) {
        if (friend_email.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i)) {
            findFriendsOnServer(friend_email,
                function(responseobject) {
                    var messageText
                    if (!responseobject.requestExists) {
                        messageText = "<div class='messagewrap'><div class='leftcontainer'><img src='content/img/user_has_no_image.jpg' /></div>"
                        messageText +=   "<div class='rightcontainer'>"
                        messageText += friend_email + " found!<div class='linkactions'><span><a href='javascript:void(0)' style='color: black' onclick='visitFriend(\"" + responseobject.id + "\")'>Visit!</a></span>"
                        messageText +=   "<span><a href='javascript:void(0)' style='color: black' onclick='addFriend(\"" + responseobject.id + "\")'>Add!</a></span></div>"
                        messageText +=   "</div><div class='clear'></div></div>"
                    } else {
                        if (responseobject.confirmed) {
                            messageText = friend_email + " is already your friend!"
                        } else {
                            if (responseobject.createdByCurrentUser ) {
                                messageText = "You have already sent a friend request to " + friend_email + "<br /><a href='javascript:void(0)' style='color: black' onclick='visitFriend(\"" + responseobject.id + "\")'>Visit!</a>"
                            }  else {
                                messageText = friend_email + " has already asked to be your friend. Check your friend requests!"
                            }

                        }
                    }
                    $("#message").html(messageText)
                }, function(errorMessage) {
                    $("#message").html(errorMessage)
                }
            )
        }
        else {
            $("#message").html("Try with an email, ok?")
        }
    } else {
        $("#message").html("One who searches, will find.")
    }
}

function findFriendsOnServer(friend_email, callback, errorCallback) {
    var data = "friend_email=" + friend_email
    var jqxhr = $.ajax("/findFriends", {
        type: "GET",
        data: data,
        dataType: "json",
        statusCode: {
            200: function(responseobject) { callback(responseobject) },
            404: function() { errorCallback(jqxhr.responseText ) }
        }
    })
}

function shareToFriend(friendId, achievementId) {
    shareToFriendOnServer(friendId, achievementId, function(ok) {
        if (ok) {
            $("#shareholderid" + friendId).html("Request sent!")
            $("#editButton").hide('fast')
        }
    })
}

function shareToFriendOnServer(friendId, achievementId, callback) {
    var data = "friendId=" + friendId  + "&achievementId=" + achievementId
    $.ajax("/shareToFriend", {
        type: "GET",
        data: data,
        dataType: "json",
        statusCode: {
            200: function() { callback(true) },
            404: function() { callback(false) }
        }
    })
}

function confirmAchievement(achievementId, userId) {
    confirmAchievementOnServer(achievementId, userId, function(title) {
        openAchievement(achievementId, userId, false, title)
    })
}

function ignoreAchievement(achievementId, userId) {
    ignoreAchievementOnServer(achievementId, userId, function() {
        openAchievements(false, userId, false)
    })
}


function confirmAchievementOnServer(achievementId, userId, callback) {
    var data = "achievementId=" + achievementId + "&userId=" + userId
    $.ajax("/confirmAchievement", {
        type: "GET",
        data: data,
        dataType: "json",
        statusCode: {
            200: function(name) { callback(name) }
        }
    })
}

function ignoreAchievementOnServer(achievementId, userId, callback) {
    var data = "achievementId=" + achievementId + "&userId=" + userId
    $.ajax("/ignoreAchievement", {
        type: "GET",
        data: data,
        dataType: "json",
        statusCode: {
            200: function() { callback() }
        }
    })
}

function visitFriend(friendId, userName) {
    getAchievementsContent(friendId, true, function(achievementsContent) {
        insertContent(achievementsContent, setDefaultMenu(userName, false), getAchievements(false, friendId, true))
    })
}

function addFriend(friendId) {
    addFriendOnServer(friendId, function(ok) {
        if (ok) {
            $("#message").html("Friend request sent.")
        }  else {
            $("#message").html("You have already requested to be friends.")
        }
    })
}

function addFriendOnServer(friendId, callback) {
    var data = "friendId=" + friendId
    $.ajax("/addFriend", {
        type: "GET",
        data: data,
        dataType: "json",
        statusCode: {
            200: function() { callback(true) },
            404: function() { callback(false) }
        }
    })
}

function removeFriendship(friendship_id) {
    ignoreFriendRequestOnServer(friendship_id, function() {
        nrOfFriendShipRequests--
        $("#friendshipid" + friendship_id).remove()
        var friendRequestRow = "<a href='javascript:void(0)' onclick='openFriends()'><span>Friends"
        if (nrOfFriendShipRequests > 0) {
            friendRequestRow += " (" + nrOfFriendShipRequests + ")"
        }
        friendRequestRow += "</span></a></li>"
        $("#friendRequestRow").html(friendRequestRow)
    })
}

function ignoreFriendRequest(friendship_id) {
    ignoreFriendRequestOnServer(friendship_id, function() {
        nrOfFriendShipRequests--
        $("#friendshipid" + friendship_id).html("")
        var friendRequestRow = "<a href='javascript:void(0)' onclick='openFriends()'><span>Friends"
        if (nrOfFriendShipRequests > 0) {
            friendRequestRow += " (" + nrOfFriendShipRequests + ")"
        }
        friendRequestRow += "</span></a></li>"
        $("#friendRequestRow").html(friendRequestRow)
    })
}

function ignoreFriendRequestOnServer(friendship_id, callback) {
    var data = "friendship_id=" + friendship_id
    $.ajax("/ignoreFriendRequest", {
        type: "GET",
        data: data,
        dataType: "json",
        statusCode: {
            200: function() { callback() }
        }
    })
}

function confirmFriendRequest(friendship_id) {
    confirmFriendRequestOnServer(friendship_id, function(responseobject) {
        var friendsRow =  '<div class="itemwrap" id="friendshipid'
            + responseobject.id
            + '"><div class="leftcontainer"><a href="javascript:void(0)" onclick="visitFriend(\''
            + responseobject.id
            + '\')"><img src="content/img/user_has_no_image.jpg" /></a></div><div class="rightcontainer"><h3><a class="headerlink" href="javascript:void(0)" onclick="visitFriend(\''
            + responseobject.id
            + '\')">'
            + responseobject.username
            + '</a></h3><span class="remove"><a style="color: #000" href="javascript:void(0)" onclick="removeFriendRequest(\''
            + responseobject.id
            + '\')">Remove</a></span></div><div class="clear"></div></div>'
        nrOfFriendShipRequests--
        $("#myfriends").append(friendsRow)

        $("#friendshipid" + friendship_id).remove()
        var friendRequestRow = "<a href='javascript:void(0)' onclick='openFriends()'><span>Friends"
        if (nrOfFriendShipRequests > 0) {
            friendRequestRow += " (" + nrOfFriendShipRequests + ")"
        }
        friendRequestRow += "</span></a></li>"
        $("#friendRequestRow").html(friendRequestRow)
    })
}

function confirmFriendRequestOnServer(friendship_id, callback) {
    var data = "friendship_id=" + friendship_id
    $.ajax("/confirmFriendRequest", {
        type: "GET",
        data: data,
        dataType: "json",
        statusCode: {
            200: function(responseobject) { callback(responseobject) }
        }
    })
}


/******************  more menu ******************/
function showMore() {
    window.history.pushState(null, null, "/")
    getMoreMenuContent(function(moreMenuContent) {
        insertContent(moreMenuContent, setDefaultMenu('More', true))
    })
}


/******************  achievements functions  ******************/
function openAchievements(completed, achieverId, lookingAtFriend, achieverName) {
    window.history.pushState(null, null, "/")
    $("#page-login").attr("id","page");
    $("#app-container-login").attr("id","app-container");
    getAchievementsContent(achieverId, lookingAtFriend, function(achievementsContent) {
          if (lookingAtFriend) {
              insertContent(achievementsContent, setDefaultMenu(achieverName, false), getAchievements(completed, achieverId, lookingAtFriend))
          }   else {
              insertContent(achievementsContent, setDefaultMenu('Achievements', true), getAchievements(completed, achieverId, lookingAtFriend))
          }
    })
}

function getAchievements(completed, achieverId, lookingAtFriend) {
    getAchievementsFromServer(completed, achieverId, lookingAtFriend,
        function(data) {
            FB.XFBML.parse();
            $("#fbLikeWeb").show()
            $("#achievementList").html(data)
              if (completed) {
                 $("#completedSpan").attr("class","selected")
                 $("#inProgressSpan").removeClass()
             } else {
                 $("#inProgressSpan").attr("class","selected")
                 $("#completedSpan").removeClass()
             }
        }
    )
}

function getAchievementsFromServer(completed, achieverId, lookingAtFriend, callback) {
    var data = "lookingAtFriend=" + lookingAtFriend
    if (achieverId) {
         data += "&achieverId=" + achieverId
    }
    if (completed) {
        $.ajax("/achievements_completed", {
            type: "GET",
            data: data,
            dataType: "json",
            success: function(data) { if ( callback ) callback(data) },
            error  : function()     { if ( callback ) callback(null) }
        })
    }  else {
        $.ajax("/achievements_inProgress", {
            type: "GET",
            data: data,
            dataType: "json",
            success: function(data) { if ( callback ) callback(data) },
            error  : function()     { if ( callback ) callback(null) }
        })
    }
}

/******************  share functions  ******************/
function openShareNotification(achievementId, achieverId, sharerId) {
    insertContent(getAchievementContent(), setDefaultMenu('Challenge!', false), getNotification(achievementId, sharerId, achieverId))
}

/******************  achievement functions  ******************/
function openAchievement(achievementId, achieverId, publiclyVisible, title) {
    window.history.pushState(null, null, "/achievement?achievementId=" + achievementId + "&userId=" + achieverId)
    insertContent(getAchievementContent(), setDefaultMenu(title, false), getAchievement(achievementId, achieverId, publiclyVisible))
}

function getNotification(achievementId, sharerId, achieverId) {
    getSharerList(achievementId, function (friendsList) {
        getAchievementFromServer(
            function(data) {
                $("#achievementDesc").html(data)
                $("#sharer-container").html(friendsList)
                $("#sharer-container").hide()
                $("#fbLike").hide()
                $("#tweetAchievement").hide()
                $("#fbLikeWeb").show()
                $("#tweetTreehouse").show()
            }, achievementId, true, sharerId, achieverId
        )
    })
}

function getAchievement(achievementId, userId, publiclyVisible) {
    getSharerList(achievementId, function (friendsList) {
        getCompareList(achievementId, function (compareList) {
            getAchievementFromServer(
                function(data) {
                    $("#achievementDesc").html(data)
                    $("#sharer-container").html(friendsList)
                    $("#sharer-container").hide()
                    $("#compare-container").html(compareList)
                    $("#compare-container").hide()
                    $('#progressTab').attr("class","selected")
                    if (publiclyVisible) {
                        $('meta[propery="og:url"]').attr('content', 'www.treehouse.io/achievement?achievementId=' + achievementId + '&userId=' + userId)
                        FB.XFBML.parse();
                        $("#publicizeButton").hide()
                        $("#fbLike").show()
                        $("#tweetAchievement").show()
                        $("#fbLikeWeb").hide()
                    } else {
                        $("#fbLike").hide()
                        $("#tweetAchievement").hide()
                        $("#fbLikeWeb").show()
                        $("#tweetTreehouse").show()
                    }
                    var els=document.body.getElementsByClassName("addbutton");
                    for(var i=0;i<els.length;i++){
                        Magnetic.addFireListener(els[i])
                    }
                }, achievementId, false, null, userId
            )
        })
    })
}

function getPublicAchievement(achieverId, achievementId) {
    getAchievementFromServer(
        function(data) {
            $("#achievementDesc").html(data)
            $("#sharer-container").hide()
            $("#compare-container").hide()
            FB.XFBML.parse();
            $("#publicizeButton").hide()
            $("#addbutton").hide()
            $("#achievementTabs").hide()
            $("#fbLike").show()
            $("#tweetAchievement").show()
            $("#fbLikeWeb").hide()
        }, achievementId, false, null, achieverId
    )
}

function getAchievementFromServer(callback,achievementId, isNotificationView, sharerId, achieverId) {
    $.ajax("/achievementFromServer?achievementId= " + achievementId + "&isNotificationView=" + isNotificationView + "&sharerId=" + sharerId  + "&achieverId=" + achieverId,  {
        type: "GET",
        dataType: "json",
        success: function(data) { if ( callback ) callback(data) },
        error  : function()     { if ( callback ) callback(null) }
    })
}

function progress(goalId, quantityTotal) {
    progressOnServer(function(quantityFinished) {
        achievementPercentageFinishedFromServer(function(achievementPercentageFinished) {
            $("#progressbar").html("<span class='progress' style='width:" + achievementPercentageFinished + "%;'></span>")
            $("#editButton").html("")

            if (achievementPercentageFinished >= 100) {
                $("#unlocked").html("Achievement unlocked! You're awesome!")
            }
            var goalPercentageFinished = (quantityFinished / quantityTotal) * 100
            $("#progressbar-goal" + goalId).html("<span class='progress' style='width:" + goalPercentageFinished + "%;'></span>")
            $("#countarea" + goalId).html("<h3>" + quantityFinished + "/" + quantityTotal + "</h3>")
            $("#latestUpdated" + goalId).html(" k'ching!")
            if (goalPercentageFinished >= 100) {
                $("#addbutton" + goalId).html("")
            }  else {
                $("#addbutton" + goalId).html('<a href="javascript:void(0)" onclick="progress(\'' + goalId + '\', \'' +  quantityTotal + '\')">'
                    + '<img src="content/img/+.png" alt="I did it!"/>'
                    + '</a>')
            }
        })
    }, goalId)
}

function achievementPercentageFinishedFromServer(callback) {
    $.ajax("/achievementPercentage", {
        type: "GET",
        dataType: "json",
        success: function(data) { if ( callback ) callback(data) },
        error  : function()     { if ( callback ) callback(null) }
    })
}

function progressOnServer(callback, goalId) {
    var data = "goalId=" + goalId
    $.ajax("/progress", {
        type: "GET",
        data: data,
        dataType: "json",
        success: function(data) { if ( callback ) callback(data) },
        error  : function()     { if ( callback ) callback(null) }
    })
}

function publicize() {
    publicizeOnServer(
        function() {
            FB.XFBML.parse();
            $("#editButton").hide()
            $("#publicizeButton").hide()
            $("#unpublicizeButton").show()
            $("#fbLike").show()
            $("#fbLikeWeb").hide()
            $("#tweetAchievement").show()
            insertLatestAchievement()
        }
    )
}

function publicizeOnServer(callback) {
    $.ajax("/publicize", {
        type: "GET",
        dataType: "json",
        success: function() { if ( callback ) callback() },
        error  : function()     { if ( callback ) callback(null) }
    })
}

function unpublicize() {
    unpublicizeOnServer(
        function(isShared) {
            if (!isShared) {
                $("#editButton").show()
                $("#deleteButton").show()
            }
            $("#unpublicizeButton").hide()
            $("#publicizeButton").show()
            $("#fbLike").hide()
            $("#fbLikeWeb").show()
            $("#tweetAchievement").hide()
            insertLatestAchievement()
        }
    )
}

function unpublicizeOnServer(callback) {
    $.ajax("/unpublicize", {
        type: "GET",
        dataType: "json",
        success: function(isShared) { if ( callback ) callback(isShared) },
        error  : function()     { if ( callback ) callback(null) }
    })
}
/******************  new achievement functions  ******************/
function createAchievement(achieverId) {
   createAchievementOnServer(
    function(data) {
        if (data == "ok") { //TODO: use ajax success/error instead
            openAchievements(false, achieverId, false)
        } else $("#message").html(data)
    })
}

function createAchievementOnServer(callback) {
    var nrOfGoals =  $('#goalTable tr').length
    var data = "currentImage=" + $("#achievementImage").attr("src")
    var goalTitles = new Array()
    var goalQuantities = new Array()
    $("form#createAchievementForm :input").each(function(i, field) {
        if (field.name) {
            if (field.name.indexOf("goalTitle") == 0) {
                goalTitles.push(field.value)
            } else if (field.name.indexOf("goalQuantity") == 0) {
                goalQuantities.push(field.value)
            } else {
                data += "&"
                data +=  field.name
                data += "="
                data +=  field.value
            }
        }
    })

    for (var i in goalTitles) {     //if any goaltitles are empty, remove goal
        if (!goalTitles[i]) {
            goalTitles.splice(i, 1)
            goalQuantities.splice(i, 1)
        }
    }

    for (var j in goalQuantities) {    //if any goalquantities are empty, remove goal
        if (!goalQuantities[j]) {
            goalTitles.splice(j, 1)
            goalQuantities.splice(j, 1)
        }
    }

    goalTitles = JSON.stringify(goalTitles)
    data += "&goalTitles=" + goalTitles
    data += "&goalQuantities=" + goalQuantities

    $.ajax("/newAchievement", {
        type: "GET",
        data: data,
        dataType: "json",
        success: function(data) { if ( callback ) callback(data) },
        error  : function()     { if ( callback ) callback(null) }
    })
}

var images = ["content/img/achievementImages/1.png",
    "content/img/achievementImages/2.png",
    "content/img/achievementImages/3.png",
    "content/img/achievementImages/4.png",
    "content/img/achievementImages/5.png",
    "content/img/achievementImages/6.png",
    "content/img/achievementImages/7.png",
    "content/img/achievementImages/8.png",
    "content/img/achievementImages/9.png",
    "content/img/achievementImages/10.png",
    "content/img/achievementImages/11.png",
    "content/img/achievementImages/12.png",
    "content/img/achievementImages/13.png",
    "content/img/achievementImages/14.png",
    "content/img/achievementImages/15.png",
    "content/img/achievementImages/16.png",
    "content/img/achievementImages/17.png",
    "content/img/achievementImages/18.png",
    "content/img/achievementImages/19.png",
    "content/img/achievementImages/20.png",
    "content/img/achievementImages/21.png",
    "content/img/achievementImages/22.png",
    "content/img/achievementImages/23.png",
    "content/img/achievementImages/24.png",
    "content/img/achievementImages/25.png",
    "content/img/achievementImages/26.png",
    "content/img/achievementImages/27.png",
    "content/img/achievementImages/28.png",
    "content/img/achievementImages/29.png",
    "content/img/achievementImages/30.png",
    "content/img/achievementImages/31.png",
    "content/img/achievementImages/32.png",
    "content/img/achievementImages/33.png",
    "content/img/achievementImages/34.png",
    "content/img/achievementImages/35.png",
    "content/img/achievementImages/36.png",
    "content/img/achievementImages/37.png",
    "content/img/achievementImages/38.png",
    "content/img/achievementImages/39.png",
    "content/img/achievementImages/40.png",
    "content/img/achievementImages/41.png",
    "content/img/achievementImages/42.png",
    "content/img/achievementImages/43.png",
    "content/img/achievementImages/44.png",
    "content/img/achievementImages/45.png",
    "content/img/achievementImages/46.png",
    "content/img/achievementImages/47.png",
    "content/img/achievementImages/48.png",
    "content/img/achievementImages/49.png"]

function toggleImage(step) {
    var currentImage = $("#achievementImage").attr("src")

    var currentPos = jQuery.inArray(currentImage, images)
    var newPos = currentPos + step
    if (newPos  >= images.length) {
        newPos = 0
    }   else if (newPos == -1) {
        newPos = images.length-1
    }
    $("#achievementImage").attr("src", images[newPos])
}

function uploadImage() {
    $("#saveButton").hide()
    var container = 'modal'
    if (isiOs) {
        $('<iframe id="imageUploadFrame" class="imageUploadFrame" style="z-index:999;" >').appendTo('body');
        container = 'imageUploadFrame'
    }
    filepicker.setKey('AM9A7pbm3QPSe24aJU2M2z')
    filepicker.pick({container: container}, function(inkBlob){
        if (isiOs) {
            $("#imageUploadFrame").remove()
        }
        $("#achievementImage").attr("src", inkBlob.url)

        //spärra från att spara under tiden
        //progresbar tills det går att spara
        filepicker.stat(inkBlob, {width: true, height: true},
            function(metadata){
                if (metadata.width == metadata.height) {
                    resizeAndStore(inkBlob)
                } else if (metadata.width > metadata.height) {
                    filepicker.convert(inkBlob, {width: metadata.height, height: metadata.height, fit: 'crop'},  function(squareInkBlob){
                        resizeAndStore(squareInkBlob)
                    })
                } else {
                    filepicker.convert(inkBlob, {width: metadata.width, height: metadata.width, fit: 'crop'},  function(squareInkBlob2){
                        resizeAndStore(squareInkBlob2)
                    })
                }
            }
        )
    })
}

function resizeAndStore(inkBlob) {
    filepicker.convert(inkBlob, {width: 96, height: 96},
        function(convertedInkBlob){
            filepicker.store(convertedInkBlob, {mimetype:"image/*", location:"S3"},
                function(stored_inkBlob){
                    var currentImage = $("#achievementImage").attr("src")
                    var currentPos = jQuery.inArray(currentImage, images)
                    images.splice(currentPos, 0, stored_inkBlob.url)
                    $("#achievementImage").attr("src", stored_inkBlob.url)
                    $("#saveButton").show()
                }
            );
        }
    );
}

function goalKeyPress(goalField) {
    var newLineNumber = $('#goalTable tr').length + 1
    if ($(goalField).closest("tr")[0].rowIndex + 2 == newLineNumber) {   //only add new goal line if the pressed goal line is the bottom one
       var goalQuantityField = "#goalQuantity" + $('#goalTable tr').length
       if (! $(goalQuantityField).val())  {
           $(goalQuantityField).val("1")
       }
       var newRow = $('<tr >' + nl  +
           '<td class="goal"><input type="text" class="formstyle" name="goalTitle' + newLineNumber + '" placeholder="goal" onkeypress="goalKeyPress(this)" onpaste="goalKeyPress(this)"></td>' + nl  +
           '<td class="quantity"><input type="text" class="formstyle" id="goalQuantity' + newLineNumber + '" name="goalQuantity' + newLineNumber + '" placeholder="1"></td>' + nl  +
           '</tr>')
       $("#goalTable").append(newRow)
       $(newRow)
           .find('td')
           .wrapInner('<div style="display: none;" />')
           .parent()
           .find('td > div')
           .slideDown(300, function(){
               var $set = $(this)
           $set.replaceWith($set.contents())
       })
    }
}

/******************  edit achievement functions  ******************/
function editAchievement() {
    editAchievementOnServer(
        function(data) {
            insertContent(getNewAchievementContent(data),setDefaultMenu('Edit', false))

        }
    )
}

function editAchievementOnServer(callback) {
    $.ajax("/editAchievement", {
        type: "GET",
        dataType: "json",
        success: function(data) { if ( callback ) callback(data) },
        error  : function()     { if ( callback ) callback(null) }
    })
}

/******************  delete achievement functions  ******************/
function deleteAchievement(achieverId) {
    deleteAchievementOnServer(
        function(data) {
            if (data == "ok") { //TODO: use ajax success/error instead
                openAchievements(false, achieverId, false)
            }
            insertLatestAchievement()
        }
    )
}

function deleteAchievementOnServer(callback) {
    $.ajax("/delete", {
        type: "GET",
        dataType: "json",
        success: function(data) { if ( callback ) callback(data) },
        error  : function()     { if ( callback ) callback(null) }
    })
}