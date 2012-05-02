var nl = '\n';
var tab = '\t';

function insertContent(content) {
    //content =   getLoginContent();
    //alert("yo: " + content);
   $("#contentArea").html(content);
}

function getLoginContent() {
    return (
        '<div id="page">' + nl +
            '<div id="content">' + nl +
            '<img class="signup-logo" src="content/img/logo-large.png" />' + nl +
            '<form action="/login" method="post">' + nl +
            '<input type="text" class="formstyle" name="username" value="username" onfocus="if (this.value == \'username\') {this.value = \'\';}" onblur="if (this.value == \'\') {this.value = \'username\';}">' + nl +
            '<span id="passwordSpan">' + nl +
            '<input type="text" class="formstyle" name="password" value="password" onfocus="securePasswordField();">' + nl +
            '</span>' + nl +
            '<div id="message"></div>' + nl +
            '<input type="submit" class="button green" value="Log in">' + nl +
            '</form>' + nl +
            '<div class="log-in-text"><a href="signup">Don\'t have an account? Sign up.</a></div>' + nl +
            '<div id="tam"></div>' + nl +
            '</div>' + nl +
            '</div>' + nl
        )
}