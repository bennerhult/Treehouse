/******************  login functions  ******************/
function checkUser() {
    checkUserOnServer(
        function(data) {
            if (data == "ok") { //TODO: use ajax success/error instead
                openAchievements();
            } else $("#message").html(data);
        }
    )
}

function checkUserOnServer(callback) {
    var username = $("input[name=username]"); 
    var password = $("input[name=password]");  
    var data = "username=" + username.val() + "&password=" + password.val();

    $.ajax("/checkUser", {     
        type: "GET",
        data: data,
        dataType: "json",
        success: function(data) { if ( callback ) callback(data); },
        error  : function()     { if ( callback ) callback(null); }
    });       
}

/******************  logout functions  ******************/
function logout() {
    $.ajax("/logout");
    insertContent(getLoginContent());
}

/******************  signup functions  ******************/
function signup() {
    signupOnServer(
        function(data) {
            if (data == "ok") {
                openAchievements();
            } else $("#message").html(data);
        }
    )
}

function signupOnServer(callback) {
    var username = $("input[name=username]");
    var password = $("input[name=password]");
    var data = "username=" + username.val() + "&password=" + password.val();

    $.ajax("/signup", {
        type: "GET",
        data: data,
        dataType: "json",
        success: function(data) { if ( callback ) callback(data); },
        error  : function()     { if ( callback ) callback(null); }
    });
}

/******************  achievements functions  ******************/
function openAchievements() {
    window.history.pushState(null, null, "/");
    insertContent(getAchievementsContent(), getAchievements);
}

function getAchievements() {
    getAchievementsFromServer(
        function(data) {
            $("#achievementList").html(data);
        }
    )
}

function getAchievementsFromServer(callback) {
    $.ajax("/achievements", {
        type: "GET",
        dataType: "json",
        success: function(data) { if ( callback ) callback(data); },
        error  : function()     { if ( callback ) callback(null); }
    });
}

/******************  achievement functions  ******************/
function openAchievement(achievementId, userId, publiclyVisible) {
    window.history.pushState(null, null, "/achievement?achievementId=" + achievementId + "&userId=" + userId);
    insertContent(getAchievementContent(), getAchievement, achievementId, userId, publiclyVisible);
}

function getAchievement(achievementId, userId, publiclyVisible) {
    getAchievementFromServer(
        function(data) {
            $('meta[propery="og:url"]').attr('content', 'www.treehouse.io/achievement?achievementId=' + achievementId + '&userId=' + userId);
            $("#achievementDesc").html(data);
            if (publiclyVisible) {
                $("#publicizeButton").empty().remove();
                jQuery.getScript('http://connect.facebook.net/en_US/all.js', function() {
                    FB.init({status: true, cookie: true, xfbml: true});
                    $("#fbLike").show();
                });
            } else {
                $("#fbLike").hide();
            }
        }, achievementId, userId
    )
}


function getPublicAchievement(achievementId, userId, publiclyVisible) {
    getAchievementFromServer(
        function(data) {
             $("#achievementDesc").html(data);
            if (publiclyVisible) {
                $("#publicizeButton").empty().remove();
                jQuery.getScript('http://connect.facebook.net/en_US/all.js', function() {
                    FB.init({status: true, cookie: true, xfbml: true});
                    $("#fbLike").show();
                    $("#addbutton").empty().remove();
                });
            } else {
                $("#fbLike").hide();
            }
        }, achievementId, userId
    )
}

function getAchievementFromServer(callback,achievementId, userId) {
    $.ajax("/achievementFromServer?achievementId= " + achievementId + "&userId=" + userId, {
        type: "GET",
        dataType: "json",
        success: function(data) { if ( callback ) callback(data); },
        error  : function()     { if ( callback ) callback(null); }
    });
}

function progress(goalId, quantityTotal) {
    progressOnServer(function(quantityFinished) {
        achievementPercentageFinishedFromServer(function(achievementPercentageFinished) {
            $("#progressbar").html("<span class='progress' style='width:" + achievementPercentageFinished + "%;'></span>");

            var goalPercentageFinished = (quantityFinished / quantityTotal) * 100;
            $("#progressbar-goal" + goalId).html("<span class='progress' style='width:" + goalPercentageFinished + "%;'></span>");
            $("#countarea" + goalId).html("<h3>" + quantityFinished + "/" + quantityTotal + "</h3>");
            if (goalPercentageFinished >= 100) {
                $("#addbutton" + goalId).html("");
            }  else {
                $("#addbutton" + goalId).html('<a href="javascript:void(0)" onclick="progress(\'' + goalId + '\', \'' +  quantityTotal + '\')">'
                    + '<img src="content/img/+.png" alt="I did it!"/>'
                    + '</a>');
            }
        })
    }, goalId)
}

function achievementPercentageFinishedFromServer(callback) {
    $.ajax("/achievementPercentage", {
        type: "GET",
        dataType: "json",
        success: function(data) { if ( callback ) callback(data); },
        error  : function()     { if ( callback ) callback(null); }
    });
}

function progressOnServer(callback, goalId) {
    var data = "goalId=" + goalId;
    $.ajax("/progress", {
        type: "GET",
        data: data,
        dataType: "json",
        success: function(data) { if ( callback ) callback(data); },
        error  : function()     { if ( callback ) callback(null); }
    });
}

function publicize() {
    publicizeOnServer(
        function() {
            $("#publicizeButton").empty().remove();
            jQuery.getScript('http://connect.facebook.net/en_US/all.js', function() {      //TODO: store locally
                FB.init({status: true, cookie: true, xfbml: true});
                $("#fbLike").show();
            });
        }
    )
}

function publicizeOnServer(callback) {
    $.ajax("/publicize", {
        type: "GET",
        dataType: "json",
        success: function() { if ( callback ) callback(); },
        error  : function()     { if ( callback ) callback(null); }
    });
}
/******************  new achievement functions  ******************/
function createAchievement() {
   createAchievementOnServer(
    function(data) {
            if (data == "ok") { //TODO: use ajax success/error instead
                openAchievements();
            }
        }
    )
}

function createAchievementOnServer(callback) {
    var nrOfGoals =  $('#goalTable tr').length;
    var data = "currentImage=" + $("#achievementImage").attr("src");
    var goalTitles = new Array();
    var goalQuantities = new Array();
    $("form#createAchievementForm :input").each(function(i, field) {
        if (field.name) {
            if (field.name.indexOf("goalTitle") == 0) {
                goalTitles.push(field.value);
            } else if (field.name.indexOf("goalQuantity") == 0) {
                goalQuantities.push( field.value);
            } else {
                data += "&";
                data +=  field.name;
                data += "=";
                data +=  field.value;
            }
        }
    });

    for (var i in goalTitles) {     //if any goaltitles are empty, remove goal
        if (!goalTitles[i]) {
            goalTitles.splice(i, 1);
            goalQuantities.splice(i, 1);
        }
    }

    for (var j in goalQuantities) {    //if any goalquantities are empty, remove goal
        if (!goalQuantities[j]) {
            goalTitles.splice(j, 1);
            goalQuantities.splice(j, 1);
        }
    }

    goalTitles = JSON.stringify(goalTitles);
      alert(goalQuantities)
    data += "&goalTitles=" + goalTitles;
    data += "&goalQuantities=" + goalQuantities;

    $.ajax("/newAchievement", {
        type: "GET",
        data: data,
        dataType: "json",
        success: function(data) { if ( callback ) callback(data); },
        error  : function()     { if ( callback ) callback(null); }
    });
}

var images = ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png"];
var imagePath= "content/img/achievementImages/";
function toggleImage(step) {
    var currentImage = $("#achievementImage").attr("src").replace(imagePath, "");
    var currentPos = jQuery.inArray(currentImage, images);
    var newPos = currentPos + step;
    if (newPos  >= images.length) {
        newPos = 0;
    }   else if (newPos == -1) {
        newPos = images.length-1;
    }
    $("#achievementImage").attr("src", imagePath + images[newPos]);
}

function goalKeyPress(goalField) {
    var newLineNumber = $('#goalTable tr').length + 1;
    if ($(goalField).closest("tr")[0].rowIndex + 2 == newLineNumber) {   //only add new goal line if the pressed goal line is the bottom one
       var goalQuantityField = "#goalQuantity" + $('#goalTable tr').length;
       if (! $(goalQuantityField).val())  {
           $(goalQuantityField).val("1");
       }
       var newRow = $('<tr>' + nl  +
           '<td class="goal"><input type="text" class="formstyle" name="goalTitle' + newLineNumber + '" placeholder="goal" onkeypress="goalKeyPress(this)" onpaste="goalKeyPress(this)"></td>' + nl  +
           '<td class="quantity"><input type="text" class="formstyle" id="goalQuantity' + newLineNumber + '" name="goalQuantity' + newLineNumber + '" placeholder="1"></td>' + nl  +
           '</tr>');
       $("#goalTable").append(newRow);
    }
}

/******************  delete achievement functions  ******************/
function deleteAchievement() {
    deleteAchievementOnServer(
        function(data) {
            if (data == "ok") { //TODO: use ajax success/error instead
                openAchievements();
            }
        }
    )
}

function deleteAchievementOnServer(callback) {
    $.ajax("/delete", {
        type: "GET",
        dataType: "json",
        success: function(data) { if ( callback ) callback(data); },
        error  : function()     { if ( callback ) callback(null); }
    });
}