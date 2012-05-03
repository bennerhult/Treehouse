var nl = '\n';
var tab = '\t';

function insertContent(content, callback) {
   $("#contentArea").html(content);
   callback();
}

function getLoginContent() {
    return (
            '<div id="page">' + nl +
                '<div id="content">' + nl +
                    '<img class="signup-logo" src="content/img/logo-large.png" />' + nl +
                    '<form action="javascript: checkUser();">' + nl +
                        '<input type="text" class="formstyle" name="username" value="username" onfocus="if (this.value == \'username\') {this.value = \'\';}" onblur="if (this.value == \'\') {this.value = \'username\';}">' + nl +
                        '<span id="passwordSpan">' + nl +
                            '<input type="text" class="formstyle" name="password" value="password" onfocus="securePasswordField();">' + nl +
                        '</span>' + nl +
                        '<div id="message"></div>' + nl +
                        '<input type="submit" class="button green" value="Log in">' + nl +
                    '</form>' + nl +
                    '<div class="log-in-text"><a href="javascript:void(0)" onclick="insertContent(getSignupContent())">Don\'t have an account? Sign up.</a></div>' + nl +
                '</div>' + nl +
            '</div>' + nl
        )
}


function getSignupContent() {
    return (
        '<div id="page">' + nl +
            '<div id="content">' + nl +
                '<img src="content/img/logo-large.png" />' + nl +
                '<h1>Sign Up</h1>' + nl +
                '<form action="javascript: signup();">' + nl +
                    '<input type="text" class="formstyle" name="username" value="username" onfocus="if (this.value == \'username\') {this.value = \'\';}" onblur="if (this.value == \'\') {this.value = \'username\';}">' + nl +
                    '<input type="text" class="formstyle" name="password" value="password" onfocus="if (this.value == \'password\') {this.value = \'\';}" onblur="if (this.value == \'\') {this.value = \'password\';}">' + nl +
                    '<div id="message"></div>' + nl +
                    '<input type="submit" class="button" value="Create my account">' + nl +
                '</form>' + nl +
                '<div class="log-in-text"><a href="javascript:void(0)" onclick="insertContent(getLoginContent())">Already awesome? Log in.</a></div>' + nl +
            '</div>' + nl +
        '</div>' + nl
        )
}

function getAchievementsContent() {
    return (
        '<div id="page">' + nl +
            '<div id="content no-padding">' + nl +
                '<div id="menu">' + nl +
                    '<ul>' + nl +
                        '<li class="back"><a href="javascript:void(0)" onclick="logout()"><img src="content/img/log-out.png" alt=""/></a></li>' + nl +
                        '<li class="logo"><img src="content/img/logo-small.png" /></li>' + nl +
                    '</ul>' + nl +
                '</div>' + nl +
                '<div id="achievementList"></div>' + nl  +
            '</div>' + nl +
        '</div>' + nl
        )
}


