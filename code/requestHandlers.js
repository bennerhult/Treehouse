var nl = '\n';
var tab = '\t';

var top = topPart();
var bottom = bottomPart();

function index(response) {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(top + bottom, 'utf-8');
}

function topPart() {
    return (
            '<!DOCTYPE html>' + nl +
            tab + '<html>' + nl +
            tab + '<head>' + nl +
            tab + '<title>Treehouse</title>' + nl +
            tab + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' + nl +
            tab + '<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no">' + nl +
            tab + '<meta name="apple-mobile-web-app-capable" content="yes">' + nl +
            tab + '<meta name="apple-mobile-web-app-status-bar-style" content="black" />' + nl +
            tab + '<link rel="apple-touch-icon" href="/content/treehouse-icon.png">' + nl +
            tab + '<link rel="icon" href="/content/favicon.ico" type="image/vnd.microsoft.icon">' + nl +
            tab + '<script type="application/javascript" src="content/js/add2home.js"></script>' + nl +
            tab + '<script type="application/javascript" src="content/js/generateContent.js"></script>' + nl +
            tab + '<script type="text/javascript" src="content/js/css3-mediaqueries.js"></script>' + nl +
            tab + '<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js" type="text/javascript"></script>' + nl +
            tab + '<link rel="stylesheet" href="content/css/add2home.css">' + nl +
            tab + '<link rel="stylesheet" href="content/css/core.css" media="screen, projection, print" />' + nl +
            tab + '<link href="http://fonts.googleapis.com/css?family=Philosopher" rel="stylesheet" type="text/css">' + nl +
            tab + '<script type="text/javascript">' + nl +

            tab + 'var addToHomeConfig = {   ' + nl +
            tab + 'autostart:false  ' + nl +
            tab + '}              ' + nl +


            tab +     'function checkUser() {' + nl +
            tab +     'checkUserOnServer(' + nl +
            tab +         'function(data) {'+ nl +
            tab +             'if (data == "ok") {'+ nl +
            tab +               'window.location = "/achievements";'+ nl +      //Erik: fix this when achievements page is ajaxified
            tab +             '} else $("#message").html(data);'+ nl +
            tab +         '}'+ nl +
            tab +     ')'+ nl +
            tab + '}'+ nl +

            tab + 'function checkUserOnServer(callback) {       ' + nl +
            tab + 'var username = $("input[name=username]"); ' + nl +
            tab + 'var password = $("input[name=password]");  ' + nl +
            tab + 'var data = "username=" + username.val() + "&password=" + password.val()' + nl +
            tab + '$.ajax("/checkUser", {     ' + nl +
            tab + 'type: "GET",   ' + nl +
            tab + 'data: data,   ' + nl +
            tab + 'dataType: "json",     ' + nl +
            tab + 'success: function(data) { if ( callback ) callback(data); },   ' + nl +
            tab + 'error  : function()     { if ( callback ) callback(null); }  ' + nl +
            tab + '});       ' + nl +
            tab + '}        ' + nl +
            tab + 'function securePasswordField() {   ' + nl +
            tab + ' $("#passwordSpan").html("<input id=\'passwordField\' type=\'password\' class=\'formstyle\' name=\'password\'>"); ' + nl +
            tab + '  $("#passwordField").focus();     ' + nl +
            tab + ' }         ' + nl +

            tab + ' window.onload = function() {      ' + nl +
            tab + ' insertContent(getLoginContent()); ' + nl +
            tab + '   setTimeout(function(){window.scrollTo(0, 1);}, 100);       ' + nl +
            tab + '   setTimeout(function(){addToHome.show(true);}, 200);      ' + nl +
            tab + '  }    ' + nl +
            tab + '  </script>        ' + nl +
            tab + '</head>    ' + nl +
            tab + ' <body id="contentArea">' + nl
        );
}

function bottomPart() {
    return (
        nl +
            tab + '</body>' + nl +
            '</html>' + nl
        );
}

exports.indexPage = index;