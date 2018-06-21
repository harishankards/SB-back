(function(){

    var mailer = require('nodemailer');
    var configs = require('./config.json');

    var smtpTransport = mailer.createTransport({
        host : "smtp.gmail.com",
        port : 465,
        secure : true,
        auth : {
            type : "OAuth2",
            user : "prabhu231197@gmail.com",
            clientId : configs.mailer.client_id,
            clientSecret : configs.mailer.client_secret,
            refreshToken : configs.mailer.refresh_token
        }
    });

    module.exports = smtpTransport;

})();