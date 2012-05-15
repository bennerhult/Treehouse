var nl = '\n';
var tab = '\t';

function showInfo(content) {
    //$("html, body").animate({scrollTop: $("#page").offset().top}, 100);
    $("#infoArea").fadeOut('fast', function() {
        $("#infoArea").html(content);
        $("#infoArea").fadeIn('fast', function() {
        });
    });
}

function getAchievementInfo() {
    return (
    '<div>' +
    '<h2>What is an Achievement?</h2>' +
    '<p><b>achievement</b> [uh-cheev-muhnt] <br>  something accomplished, especially by superior ability, special effort, great courage, etc.; a great or heroic deed.</p>' +
    '<h2>Why should I want to achieve something?</h2>' +
    '<p>Because you can! Seriously, you might as well ask the purpose of life. An achievement is it\'s own reward.</p>' +
    '<h2>Ok! But why Treehouse?</h2>' +
    '<p>For many of us, achievements are that much sweeter when they are tracked and made tangible. A diploma, a medal, a title - the recognition you deserve. <br /><br />Imagine a magical place where you could store and track all your achievements. Treehouse is all that. Ever wanted to see how many points you had IRL?</p>' +
    '<h2>I create my own achievements?</h2>' +
    '<p>Yup. <b>You</b> decide what <b>you</b> want to achieve. Have you got a list of things that you just have to do before you die? Are you doing something amazing and can\'t wait to show your peers? What do you want to celebrate when it is done?<br /><br />Only you can tell the limits of your dreams and ambitions. Powerful forces to be sure. What motivates you?</p>' +
    '<h2>Is it free?</h2>' +
    '<p>It is free.</p>' +
    '<h2>Can my friends see my achievements?</h2>' +
    '<p>When you want to share your feeling of accomplishment (the technical term would be brag) you can publicize your achievements. You can easily share to Facebook or copy the link and share it however you want. We\'ve heard that some people still use email. If you do not publicize an achievement, only you can see it. Nothing wrong with tracking your success and be proud all by yourself.</p>' +
    '</div>'
        )
}

function getAbout() {
    return (
        '<div>' +
            '<p>We ♥ node.js</p>' +
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