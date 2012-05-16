var nl = '\n';
var tab = '\t';

function insertContent(content, callback, achievementId, userId, publicView) {
    $("#contentArea").html(content);

    if (window.innerWidth < 819) {
        $("html, body").animate({scrollTop: $("#menu").offset().top}, 200);
    }

    callback(achievementId, userId, publicView);
}

function getLoginContent() {
    return (
            '<div id="content">' + nl +
                '<div class="signup-logo"><img src="content/img/logo-large.png" /></div>' + nl +
                '<form action="javascript: checkUser();">' + nl +
                    '<input type="text" class="formstyle" name="username" placeholder="email"">' + nl +
                    '<span id="passwordSpan">' + nl +
                        '<input type="password" class="formstyle" name="password" placeholder="password">' + nl +
                    '</span>' + nl +
                    '<div id="message"></div>' + nl +
                    '<input type="submit" class="button green" value="Log in">' + nl +
                '</form>' + nl +
                '<div class="log-in-text"><a href="javascript:void(0)" onclick="insertContent(getSignupContent())">Don\'t have an account? Sign up. It\'s free.</a></div>' + nl +
            '</div>' + nl
        )
}

function getSignupContent() {
    return (
            '<div id="content">' + nl +
                '<div class="signup-logo"><img src="content/img/logo-large.png" /></div>' + nl +
                '<h1 class="signup">Sign Up</h1>' + nl +
                '<form action="javascript: signup();">' + nl +
                    '<input type="text" class="formstyle" name="username" placeholder="email">' + nl +
                    '<input type="password" class="formstyle" name="password" placeholder="password">' + nl +
                    '<div id="message"></div>' + nl +
                    '<input type="submit" class="button" value="Create my account">' + nl +
                '</form>' + nl +
                '<div class="log-in-text"><a href="javascript:void(0)" onclick="insertContent(getLoginContent())">Already awesome? Log in.</a></div>' + nl +
            '</div>' + nl

        )
}

function getAchievementsContent() {
    return (
            '<div id="content no-padding">' + nl +
                '<div id="menu">' + nl +
                    '<ul>' + nl +
                        '<li class="back"><a href="javascript:void(0)" onclick="logout()"><img src="content/img/log-out.png" alt=""/></a></li>' + nl +
                        '<li class="logo"><img src="content/img/logo-small.png" /></li>' + nl +
                    '</ul>' + nl +
                '</div>' + nl +
                '<div id="achievementList"></div>' + nl  +
            '</div>' + nl
        )
}

function getAchievementContent() {
    return (
        '<div id="fb-root"></div>' + nl  +
        '<script>(function(d, s, id) { ' + nl  +
        'var js, fjs = d.getElementsByTagName(s)[0]; ' + nl  +
        'if (d.getElementById(id)) return;' + nl  +
        'js = d.createElement(s); js.id = id;' + nl  +
        'js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";' + nl  +
        'fjs.parentNode.insertBefore(js, fjs);' + nl  +
        '}(document, "script", "facebook-jssdk"));</script>' + nl  +
        '<div id="app-container">' + nl  +
            '<div id="content no-padding">' + nl  +
                '<div id="menu">' + nl  +
                    '<ul>' + nl  +
                        '<li class="back"><a href="javascript:void(0)" onclick="openAchievements()"><img src="content/img/back-1.png" alt=""/></a></li>' + nl  +
                        '<li class="logo"><img src="content/img/logo-small.png" /></li>' + nl  +
                        '<li class="add"><a href="javascript:void(0)" onclick="deleteAchievement()"><img src="content/img/delete.png" /></a></li>' + nl  +
                    '</ul>' + nl  +
                '</div>' + nl  +
                '<div id="achievementDesc"></div>' + nl  +
            '</div>' + nl +
        '</div>' + nl
    )
}

function getPublicAchievementContent() {
    return (
        '<div id="fb-root"></div>' + nl  +
        '<script>(function(d, s, id) { ' + nl  +
        'var js, fjs = d.getElementsByTagName(s)[0]; ' + nl  +
        'if (d.getElementById(id)) return;' + nl  +
        'js = d.createElement(s); js.id = id;' + nl  +
        'js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";' + nl  +
        'fjs.parentNode.insertBefore(js, fjs);' + nl  +
        '}(document, "script", "facebook-jssdk"));</script>' + nl  +
        '<div id="app-container">' + nl  +
            '<div id="content no-padding">' + nl  +
                '<div id="menu">' + nl  +
                    '<ul>' + nl  +
                        '<li class="back"></li>' + nl  +
                        '<li class="logo"><a href="/"><img src="content/img/logo-small.png" /></a></li>' + nl  +
                    '</ul>' + nl  +
                '</div>' + nl  +
                '<div id="achievementDesc"></div>' + nl  +
            '</div>' + nl +
        '</div>' + nl
    )
}

function getNewAchievementContent() {
    return (
        '<div id="app-container">' + nl  +
            '<div id="content no-padding">' + nl  +
                '<div id="menu">' + nl  +
                    '<ul>' + nl  +
                        '<li class="back"><a href="javascript:void(0)" onclick="openAchievements()"><img src="content/img/back-1.png" alt=""/></a></li>' + nl  +
                        '<li class="logo"><img src="content/img/logo-small.png" /></li>' + nl  +
                    '</ul>' + nl  +
                '</div>' + nl  +
                '<form id="createAchievementForm" action="javascript: createAchievement();">' + nl  +
                    '<div class="achievement-info">' + nl  +
                        '<div class="inputarea">' + nl  +
                            '<input type="text" class="formstyle" name="title" placeholder="title">' + nl  +
                            '<textarea class="formstyle" name="description" placeholder="description"></textarea>' + nl  +
                        '</div>' + nl  +
                        '<div class="imagearea-container">' + nl  +
                            '<div class="create-imagearea">' + nl  +
                            '<img id="achievementImage" src="content/img/achievementImages/1.png" alt="" />' + nl  +
                            '<span class="gradient-bg"></span>' + nl  +
                        '</div>' + nl  +
                        '<div class="fileinputs">' + nl  +
                            '<ul>' + nl  +
                                '<li><a href="javascript:void(0)" onclick="toggleImage(-1)"><img src="content/img/left-arrow.png" alt="" /></a></li>' + nl  +
                                '<li class="last"><a href="javascript:void(0)" onclick="toggleImage(1)"><img src="content/img/right-arrow.png" alt="" /></a></li>' + nl  +
                            '</ul>' + nl  +
                        '</div>' + nl  +
                    '</div>' + nl  +
                    '<div class="clear"></div>' + nl  +
                '</div>' + nl  +
                '<div id="achievement-container">' + nl  +
                    '<div class="part-achievement">' + nl  +
                        '<table id="goalTable">' + nl  +
                            '<tr>' + nl  +
                                '<td class="goal"><input type="text" class="formstyle" name="goalTitle1" placeholder="goal" onkeypress="goalKeyPress(this)" onpaste="goalKeyPress(this)"></td>' + nl  +
                                '<td class="quantity"><input type="text" class="formstyle" id="goalQuantity1" placeholder="1" name="goalQuantity1"></td>' + nl  +
                            '</tr>' + nl  +
                        '</table>' + nl  +
                        '<div class="clear"></div>' + nl  +
                    '</div>' + nl  +
                '</div>' + nl  +
                ' <div class="create-achievement">' + nl  +
                    '<input type="submit" class="button" value="Create achievement">' + nl  +
                '</div>' + nl  +
            '</form>' + nl  +
        '</div>' + nl  +
    '</div>'
    )
}