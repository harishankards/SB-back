(function(){

    var mailer = require('nodemailer');
    var smtpTransport = mailer.createTransport({
        host : "smtp.gmail.com",
        port : 465,
        secure : true,
        auth : {
            type : "OAuth2",
            user : "spritle.testing@gmail.com",
            clientId : '359461739004-6v07ao9crh3ltq84gakjng8lflm0kkps.apps.googleusercontent.com',
            clientSecret : 'OuTh1hB67JXUoY1JXTYrXuRl',
            refreshToken : '1/o9LobTZNLhPM_-719DIgVeN5zAzqxCvmVKiADL_qCvYFYY17YtKOEWF0KVDaVtzf'
        }
    });

    module.exports = smtpTransport;

})();