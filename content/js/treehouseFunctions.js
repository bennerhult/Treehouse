/******************  login functions  ******************/

 function securePasswordField() {
    $("#passwordSpan").html("<input id=\'passwordField\' type=\'password\' class=\'formstyle\' name=\'password\'>");
    $("#passwordField").focus();
}

function checkUser() {
    checkUserOnServer(
        function(data) {
            if (data == "ok") {
                window.location = "/achievements";     //TODO: fix this when achievements page is ajaxified
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

/******************  signup functions  ******************/

function signup() {
    signupOnServer(
        function(data) {
            if (data == "ok") {                        //TODO: use ajax success/error instead
                window.location = "/achievements";     //TODO: fix this when achievements page is ajaxified
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