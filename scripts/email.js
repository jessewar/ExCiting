var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'jessewarre@gmail.com',
        pass: 'captaincrunch28!'
    }
});

var mailOptions = {
    from: 'Africa <jesse.warre@gmail.com>', // sender address
    to: 'jesse.warren@live.com, killeentm@gmail.com, grbritz@gmail.com', // list of receivers
    subject: 'Congradulations', // Subject line
    text: 'Congradulations', // plaintext body
    html: 'You have been selected for our grand prize of <b>a free trip to Pen Island</b>' // html body
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});
