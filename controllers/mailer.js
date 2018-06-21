var smtpTransport = require('../config/smtpTransport');

module.exports.sendVerificationToken = function(token,link,email,callback){
    try{
        var mail = {
            from: "ISupport Team",
            to: email,
            subject: 'User Verification for Isupport',
            text: `Use OTP '${token}' to verify your Email id or Click this link to activate your account ${link}`,
        };

        smtpTransport.sendMail(mail,function(err,response){
            callback(err,response);
        });

    }
    catch(err){

    }
};