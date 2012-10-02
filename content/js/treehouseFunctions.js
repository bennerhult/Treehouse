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
                            function(userId, ok) {
                                if (ok) { //TODO: use ajax success/error instead
                                    openAchievements(false, userId, false)
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

/******************  tab menu functions  ******************/
function toggleTab() {
    $('#tab-menu').slideToggle('fast');
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

/******************  friends functions  ******************/
function findFriends() {
    var friend_email = $("input[name=friend_email]").val()
    if (friend_email) {
        if (friend_email.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i)) {
            findFriendsOnServer(friend_email,
                function(responseobject) {
                    var messageText
                    if (!responseobject.requestExists) {
                        messageText = friend_email + " found!<br /><a href='javascript:void(0)' style='color: black' onclick='visitFriend(\"" + responseobject.id + "\")'>Visit!</a>"
                        messageText +=   "<br /><a href='javascript:void(0)' style='color: black' onclick='addFriend(\"" + responseobject.id + "\")'>Add!</a>"
                    } else {
                        if (responseobject.confirmed) {
                            messageText = friend_email + " is already your friend!"
                        } else {       //TODO funkar om man skickat ett request, inte om man är mottagaren av det
                            messageText = "You have already sent a friend request to " + friend_email + "<br /><a href='javascript:void(0)' style='color: black' onclick='visitFriend(\"" + responseobject.id + "\")'>Visit!</a>"
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

function visitFriend(friendId) {
    insertContent(getAchievementsContent(), setDefaultMenu(true, true), getAchievements(false, friendId, true))
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
    confirmFriendRequestOnServer(friendship_id, function() {
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

function confirmFriendRequestOnServer(friendship_id, callback) {
    var data = "friendship_id=" + friendship_id
    $.ajax("/confirmFriendRequest", {
        type: "GET",
        data: data,
        dataType: "json",
        statusCode: {
            200: function() { callback() }
        }
    })
}

/******************  achievements functions  ******************/
function openAchievements(completed, achieverId, lookingAtFriend) {
    window.history.pushState(null, null, "/")
    $("#page-login").attr("id","page");
    $("#app-container-login").attr("id","app-container");
    completedAchievementsExistFromServer(function(completedExists) {
        insertContent(getAchievementsContent(), setDefaultMenu(completedExists, lookingAtFriend), getAchievements(completed, achieverId, lookingAtFriend))
    })
}

function completedAchievementsExistFromServer(callback) {
    $.ajax("/completedAchievementsExist", {
        type: "GET",
        dataType: "json",
        success: function(data) { if ( callback ) callback(data) },
        error  : function()     { if ( callback ) callback(null) }
    })
}

function getAchievements(completed, achieverId, lookingAtFriend) {
    getAchievementsFromServer(completed, achieverId, lookingAtFriend,
        function(data) {
            FB.XFBML.parse();
            $("#fbLikeWeb").show()
            $("#achievementList").html(data)
            $('#tab-menu').hide('fast')
              if (completed) {
                 $("#completed").attr("class","selected")
                 $("#inProgress").removeClass()
             } else {
                 $("#inProgress").attr("class","selected")
                 $("#completed").removeClass()
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

/******************  achievement functions  ******************/
function openAchievement(achievementId, achieverId, publiclyVisible, progressMade, completed, lookingAtFriend) {
    window.history.pushState(null, null, "/achievement?achievementId=" + achievementId + "&userId=" + achieverId)
    isLatestAchievement(achievementId, function(isLatestAchievement) {
        insertContent(getAchievementContent(), setAchievementMenu(publiclyVisible, progressMade, isLatestAchievement, completed, achieverId, lookingAtFriend), getAchievement(achievementId, achieverId, publiclyVisible))
    })
}

function isLatestAchievement(achievementId, callback) {
    $.ajax("/latestAchievementId" , {
        type: "GET",
        dataType: "json",
        success: function(latestAchievementId) {
            if (latestAchievementId) {
                callback(latestAchievementId === achievementId)
            }  else {
                callback(false)  //no latest achievement exists
            }
        }, error  : function()     {
            callback(true)  //we don't know, but we assume so to avoid removal of the achievement should it be the latest
        }
    })

}

function getAchievement(achievementId, userId, publiclyVisible) {
    getAchievementFromServer(
        function(data) {
            $("#achievementDesc").html(data)
            if (publiclyVisible) {
                $('meta[propery="og:url"]').attr('content', 'www.treehouse.io/achievement?achievementId=' + achievementId + '&userId=' + userId)
                FB.XFBML.parse();
                $("#publicizeButton").empty().remove()
                $("#fbLike").show()
                $("#fbLikeWeb").hide()
            } else {
                $("#fbLike").hide()
                $("#fbLikeWeb").show()
            }
        }, achievementId, userId
    )
}

function getPublicAchievement(achievementId, userId) {
    getAchievementFromServer(
        function(data) {
             $("#achievementDesc").html(data)
            FB.XFBML.parse();
            $("#publicizeButton").empty().remove()
            $("#addbutton").empty().remove()
            $("#fbLike").show()
            $("#fbLikeWeb").hide()
        }, achievementId, userId
    )
}

function getAchievementFromServer(callback,achievementId, userId) {
    $.ajax("/achievementFromServer?achievementId= " + achievementId + "&userId=" + userId, {
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

            var goalPercentageFinished = (quantityFinished / quantityTotal) * 100
            $("#progressbar-goal" + goalId).html("<span class='progress' style='width:" + goalPercentageFinished + "%;'></span>")
            $("#countarea" + goalId).html("<h3>" + quantityFinished + "/" + quantityTotal + "</h3>")
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
            $("#editButton").html("")
            $("#deleteButton").html("")
            $("#publicizeButton").empty().remove()
            $("#fbLike").show()
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
/******************  new achievement functions  ******************/
function createAchievement(achieverId) {
   createAchievementOnServer(
    function(data) {
            if (data == "ok") { //TODO: use ajax success/error instead
                openAchievements(false, achieverId, false)
            } else $("#message").html(data)
        }
    )
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

var images = ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png", "8.png", "9.png", "10.png", "11.png", "12.png", "13.png", "14.png", "15.png", "16.png", "17.png", "18.png", "19.png", "20.png", "21.png", "22.png", "23.png", "24.png", "25.png", "26.png", "27.png", "28.png", "29.png", "30.png", "31.png", "32.png", "33.png", "34.png", "35.png", "36.png", "37.png", "38.png", "39.png", "40.png", "41.png", "42.png", "43.png", "44.png", "45.png", "46.png", "47.png", "48.png", "49.png"]
var imagePath= "content/img/achievementImages/"
function toggleImage(step) {
    var currentImage = $("#achievementImage").attr("src").replace(imagePath, "")
    var currentPos = jQuery.inArray(currentImage, images)
    var newPos = currentPos + step
    if (newPos  >= images.length) {
        newPos = 0
    }   else if (newPos == -1) {
        newPos = images.length-1
    }
    $("#achievementImage").attr("src", imagePath + images[newPos])
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
function editAchievement(userId) {
    editAchievementOnServer(
        function(data) {
            insertContent(getNewAchievementContent(data, userId))
            setCreateEditMenu(data)
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