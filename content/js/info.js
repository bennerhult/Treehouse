var nl = '\n'

var activeMenuIndex = 0;

function selectActiveMenu(activeMenuNr) {
    activeMenuIndex = activeMenuNr
    $('#web-menu ul li a span').removeClass('selected')
    if (activeMenuNr >= 0) {
        $('#web-menu ul li a span:eq(' + activeMenuNr + ')').addClass('selected')
    }
}

function showInfo(content, activeMenuNr) {
    if (activeMenuNr != activeMenuIndex) {
        selectActiveMenu(activeMenuNr)
        //$("html, body").animate({scrollTop: $("#page").offset().top}, 100)
        $("#infoArea").fadeOut('fast', function() {
            $("#infoArea").html(content)
            $("#infoArea").fadeIn('fast', function() {
            })
        })
    }
}

function getAchievementInfo() {
    return (
    '<div>' +
    '<h2>What is an Achievement?</h2>' +
    '<p><b>achievement</b> [uh-cheev-muhnt] <br>  something accomplished, especially by superior ability, special effort, great courage, etc.; a great or heroic deed.</p>' +
    '<h2>Why should I want to achieve something?</h2>' +
    '<p>Because you can? An achievement is it\'s own reward.</p>' +
    '<h2>Ok! But why Treehouse?</h2>' +
    '<p>For many of us, achievements are that much sweeter when they are tracked and made tangible. A diploma, a medal, a title - the recognition you deserve. <br /><br />Imagine a magical place where you could store and track all your achievements. Treehouse is all that. Ever wanted to see how many points you had IRL?</p>' +
    '<h2>I create my own achievements?</h2>' +
    '<p>Yup. <b>You</b> decide what <b>you</b> want to achieve. Have you got a list of things that you just have to do before you die? Are you doing something amazing and can\'t wait to show your peers? What do you want to celebrate when it is done?<br /><br />Only you can tell the limits of your dreams and ambitions. Powerful forces to be sure. What motivates you?</p>' +
    '<p>Also, you can encourage your friends by sharing your achievements with them and compare your progress. Challenge accepted?</p>' +
    '<h2>Can my friends see my achievements?</h2>' +
    '<p>If you want them to - publicize or share it. When you want to share your feeling of accomplishment (the technical term would be brag) you can publicize your achievements. Once an achievement is publicized, it is visible to the world and you can easily like it and post to Facebook or copy the link and send it however you want. Even by trusty old email. If you do not publicize or share an achievement, only you can see it. Nothing wrong with tracking your success and be proud all by your lonesome.</p>' +
    '<h2>Is it free?</h2>' +
    '<p>It is free.</p>' +
    '</div>'
        )
}

function getAbout() {
    return (
        '<div>' +
            '<h2>A library of dreams</h2>' +
            '<p>Treehouse is our digital library of dreams, where we can store our past achievements and keep track of our dreams for tomorrow. We hope that you will use it to bring out the best in you, by pushing yourself into your desired behavior.</p>' +
            '<h2>We ♥ node.js</h2>' +
            '<p>Treehouse is thought out, designed and lovingly put together in Stockholm. It runs on the amazing Heroku-platform (from San Francisco) and stores all data on MongoHQ (based in Mountain View, California).<br />' +
            'If all this sounds awfully technical, leave the implementation details to us. We\'re vikings, we know what we\'re doing.</p>' +
            '<p>Questions? Feeling chatty? Don\'t be a stranger. <a href="mailto:staff@treehouse.io">staff@treehouse.io</a></p>' +
       '</div>'
        )
}

function getMiscInfo() {
    return (
        '<div>' +
            '<h2>Why no password?</h2>' +
            '<p>We consider Treehouse to be a library of dreams, and it is hardly anybody\'s dream to keep track of another password.</p>' +
            '<p>There is also security to consider (we do build bank solutions in our day jobs). Two simple rules of security: <br />' +
            '1. Do not give away your password to an entity you do not trust.<br />' +
            '2. Do not trust any* entity who entertains the feeble security notion of a password.<br /><br /> ' +
            'As you have no doubt already noticed, these two laws form an infinity loop. Clever, huh?<br /><br /><br /><br />' +
            '* unless they are silly big and have security people that can handle it, like Facebook. Also, we know you already have a Facebook account and we choose our battles.</p>' +
            '</div>'
        )
}

function getFeatureInfo() {
    return (
        '<div>' +
            '<h2>Share & compare</h2>' +
            '<p>Encourage your friends by sharing your achievements with them and compare your progress. Challenge accepted?</p>' +
            '<h2>Publicize</h2>' +
            '<p>When you want to share your feeling of accomplishment (the technical term would be brag) you can publicize your achievements. Once an achievement is publicized, you can easily like it and post to Facebook or copy the link and send it however you want. Even by trusty old email. If you do not publicize or share an achievement, only you can see it. Nothing wrong with tracking your success and be proud all by your lonesome.</p>' +
            '<h2>15 minutes of fame</h2>' +
            '<p>The latest publicized achievement is showcased on the front page of treehouse.io, so that the whole world gets a glimpse of your awesomeness.</p>' +
        '</div>'
        )
}

function getEarlyAdopterInfo() {
    return (
        '<div>' +
            '<h2>the Coveted Early Adopter Achievement</h2>' +
            '<p>You are so much of an early adopter that you cannot even get it yet! Impressive! Sign up now and you will be first in line when it appears!</p>' +
            '</div>'
        )
}

function getStart() {
    return (
        '<img src="content/img/treehouse.jpg" />'
        )
}