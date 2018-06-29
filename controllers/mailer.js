var smtpTransport = require('../config/smtpTransport');

module.exports.sendVerification = function(link,email,callback){
    try{
        var mail = {
            from: "Student-burger <spritle.testing@gmail.com>",
            to: email,
            subject: 'User Verification for Student burger',
            html: `Click <a href=${link}>here</a> to activate your account`,
        };

        smtpTransport.sendMail(mail,function(err,response){
            callback(err,response);
        });

    }
    catch(err){
        callback(err);
    }
};