var nl = '\n';
var tab = '\t';

function showInfo(content) {
    $("#infoArea").fadeOut('slow', function() {
        $("#infoArea").html(content);
        $("#infoArea").fadeIn('slow', function() {
        });
    });

}

function getAchievementInfo() {
    return (
    '<h2>What is an Achievement?</h2>' +
    '<p><b>achievement</b> [uh-cheev-muhnt] <br>  something accomplished, especially by superior ability, special effort, great courage, etc.; a great or heroic deed.</p>' +
    '<h2>Why should I want to achieve something?</h2>' +
    '<p>Because you can! Seriously, you might as well ask the purpose of life. An achievement is it\'s own reward.</p>' +
    '<h2>Ok! But why Treehouse?</h2>' +
    '<p>For many of us, achievements are sweeter when they are tracked and made tangible. It\'s nice to get a diploma, a medal, a title. <br />Store and track all things you want to achieve in Treehouse.</p>' +
    '<h2>Is it free?</h2>' +
    '<p>It is free.</p>' +
    '<h2>Can my friends see my achievements?</h2>' +
    '<p>When you want to share your feeling of accomplishment (or simply brag) you can publicize your achievements. You can easily share to Facebook or copy the link and share it however you want. We\'ve heard that some people still use email. If you do not share an achievement, only you can see it. Nothing wrong with tracking your success and be proud all by yourself.</p>'
        )
}

function getEarlyAdopterInfo() {
    return (
        '<h2>the Coveted Early Adopter Achievement</h2>' +
            '<p>This is so brand new that you cannot even get it yet! Sign up now and you will be first in line when it appears!</p>'
        )
}

function getStart() {
    return (
        '<img src="content/img/treehouse.jpg" />'
        )
}
