/******************  login functions  ******************/
function checkUser() {
    checkUserOnServer(
        function(data) {
            if (data == "ok") { //TODO: use ajax success/error instead
                openAchievements(false)
            } else $("#message").html(data)
        }
    )
}

function checkUserOnServer(callback) {
    var username = $("input[name=username]")
    var password = $("input[name=password]")
    var data = "username=" + username.val() + "&password=" + password.val()

    $.ajax("/checkUser", {     
        type: "GET",
        data: data,
        dataType: "json",
        success: function(data) { if ( callback ) callback(data) },
        error  : function()     { if ( callback ) callback(null) }
    })
}

function loginUsingFacebook() {
    FB.login(function(response) {
        if (response.authResponse) {
            FB.api('/me', function(me) {
                checkFBUserOnServer(me.email,
                    function(data) {
                        if (data == "ok") { //TODO: use ajax success/error instead
                            openAchievements(false)
                        } else {
                            $("#message").html('Facebook did not play nice')
          				}
					}
				)
            })
        } else {
            $("#message").html('Facebook did not play nice!')
        }
    }, {scope: 'email'})
}                     //, redirect_uri: '/', display : 'touch'

function checkFBUserOnServer(username, callback) {
    var data = "username=" + username
    $.ajax("/checkFBUser", {
        type: "GET",
        data: data,
        dataType: "json",
        success: function(data) { if ( callback ) callback(data) },
        error  : function()     { if ( callback ) callback(null) }
    })
}

function rememberMe() {
    rememberMeOnServer(
        function(data) {
            if (data == "ok") { //TODO: use ajax success/error instead
                openAchievements(false)
            }  else {
                insertContent(getLoginContent(), setEmptyMenu(), null)
            }
        }
    )
}

function rememberMeOnServer(callback) {
    $.ajax("/rememberMe", {
        type: "GET",
        dataType: "json",
        success: function(data) { if ( callback ) callback(data) },
        error  : function()     { if ( callback ) callback(null) }
    })
}

/******************  tab menu functions  ******************/
function toggleTab() {
    $('#tab-menu').slideToggle('fast');
}

/******************  logout functions  ******************/
function logout() {
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            FB.logout()
        } else if (response.status === 'not_authorized') {
            FB.logout()
        }
    })
    $.ajax("/logout", {
        type: "GET",
        dataType: "json",
        success: function() { insertContent(getLoginContent(), setEmptyMenu(), null) },
        error  : function() { insertContent(getLoginContent(), setEmptyMenu(), null) }

    })
}

/******************  signup functions  ******************/
function signup() {
    signupOnServer(
        function(data) {
            if (data == "ok") {
                openAchievements(false)
            } else $("#message").html(data)
        }
    )
}

function signupOnServer(callback) {
    var username = $("input[name=username]")
    var password = $("input[name=password]")
    var data = "username=" + username.val() + "&password=" + password.val()

    $.ajax("/signup", {
        type: "GET",
        data: data,
        dataType: "json",
        success: function(data) { if ( callback ) callback(data) },
        error  : function()     { if ( callback ) callback(null) }
    })
}

/******************  friends functions  ******************/
function findFriends() {
    var friend_email = $("input[name=friend_email]").val()
    if (friend_email) {
        if (friend_email.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i)) {
            findFriendsOnServer(friend_email,
                function(data, found) {
                    if ( found ) {
                        $("#message").html(friend_email + " found!<br /><a href='javascript:void(0)' onclick='visitFriend(\"" + data + "\")'>Visit!</a>")
                    } else {
                        $("#message").html(data)
                    }
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

function findFriendsOnServer(friend_email, callback) {
    var data = "friend_email=" + friend_email

    var jqxhr = $.ajax("/findFriends", {
        type: "GET",
        data: data,
        dataType: "json",
        statusCode: {
            200: function(returnData) { callback(returnData, true) },
            404: function() { callback(jqxhr.responseText , false) }
        }
    })
}

function visitFriend(friendId) {

}
/******************  achievements functions  ******************/
function openAchievements(completed) {
    window.history.pushState(null, null, "/")
    completedAchievementsExistFromServer(function(completedExists) {
        insertContent(getAchievementsContent(), setDefaultMenu(completedExists), getAchievements(completed))
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


function getAchievements(completed) {
    getAchievementsFromServer(completed,
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

function getAchievementsFromServer(completed, callback) {
    if (completed) {
        $.ajax("/achievements_completed", {
            type: "GET",
            dataType: "json",
            success: function(data) { if ( callback ) callback(data) },
            error  : function()     { if ( callback ) callback(null) }
        })
    }  else {
        $.ajax("/achievements_inProgress", {
            type: "GET",
            dataType: "json",
            success: function(data) { if ( callback ) callback(data) },
            error  : function()     { if ( callback ) callback(null) }
        })
    }
}

/******************  achievement functions  ******************/
function openAchievement(achievementId, userId, publiclyVisible, progressMade, completed) {
    window.history.pushState(null, null, "/achievement?achievementId=" + achievementId + "&userId=" + userId)
    isLatestAchievement(achievementId, function(isLatestAchievement) {
        insertContent(getAchievementContent(), setAchievementMenu(publiclyVisible, progressMade, isLatestAchievement, completed, userId), getAchievement(achievementId, userId, publiclyVisible))
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
function createAchievement() {
   createAchievementOnServer(
    function(data) {
            if (data == "ok") { //TODO: use ajax success/error instead
                openAchievements(false)
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
function deleteAchievement() {
    deleteAchievementOnServer(
        function(data) {
            if (data == "ok") { //TODO: use ajax success/error instead
                openAchievements(false)
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