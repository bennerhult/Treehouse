module.exports = (function () {
    'use strict';

    var emailjs = require('emailjs');

    var server  = emailjs.server.connect({
        user:    'pe3116x3',
        password:'wPWHEybx',
        host:    'amail3.space2u.com',
        port:    2525,
        ssl:     false
    });

    function emailUser(emailAddress, subject, html, altText, callback) {
        server.send({
            text:    altText,
            from:    'Treehouse <staff@treehouse.io>',
            to:      '<' + emailAddress + '>',
            subject: subject,
            attachment:
                [
                    {data: html, alternative:true}
                ]
        }, function(err, message) {
            if (err) console.log("error sending email: " + err + ", message: " + message);
        });
        if (callback) callback();
    }

    return { emailUser : emailUser };
}());