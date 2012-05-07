/******************  login functions  ******************/

 function securePasswordField() {
    $("#passwordSpan").html("<input id=\'passwordField\' type=\'password\' class=\'formstyle\' name=\'password\'>");
    $("#passwordField").focus();
}

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
function openAchievement(achievementId, userId) {
    window.history.pushState(null, null, "/achievement?achievementId=" + achievementId + "&userId=" + userId);
    insertContent(getAchievementContent(), getAchievement, achievementId, userId);
}

function getAchievement(achievementId, userId) {
    getAchievementFromServer(
        function(data) {
            $("#achievementDesc").html(data);
        }, achievementId, userId
    )
}

function getAchievementFromServer(callback,achievementId, userId) {
    $.ajax("/achievement?achievementId= " + achievementId + "&userId=" + userId, {
        type: "GET",
        dataType: "json",
        success: function(data) { if ( callback ) callback(data); },
        error  : function()     { if ( callback ) callback(null); }
    });
}

function progress(goalId, quantityTotal) {

    progressOnServer(
        function(quantityFinished) {
            var myPercentageFinished = (quantityFinished / quantityTotal) * 100;
            $("#progressbar").html("<span class='progress' style='width:" + myPercentageFinished + "%;'></span>");
            $("#progressbar-goal").html("<span class='progress' style='width:" + myPercentageFinished + "%;'></span>");
            $("#countarea").html("<h3>" + quantityFinished + "/" + quantityTotal + "</h3>");
        }, goalId
    )
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
    var title = $("input[name=title]");
    var description = $("textarea[name=description]");
    var goalQuantity = $("input[name=goalQuantity]");
    var goalTitle = $("input[name=goalTitle]");

    var data = "title=" + title.val() + "&description=" + description.val() + "&goalQuantity=" + goalQuantity.val() + "&goalTitle=" + goalTitle.val();

    $.ajax("/newAchievement", {
        type: "GET",
        data: data,
        dataType: "json",
        success: function(data) { if ( callback ) callback(data); },
        error  : function()     { if ( callback ) callback(null); }
    });
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