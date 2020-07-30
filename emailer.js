var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tranquangcuong1995@gmail.com',
        pass: 'cuongtran'
    }
});

var mailOptions = {
    from: 'tranquangcuong1995@gmail.com',
    to: 'accun1112@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});