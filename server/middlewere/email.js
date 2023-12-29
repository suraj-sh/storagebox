const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
    // CREATE A TRANSPORTER
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        }
    });
    

    const emailOptions = {
        from: 'StorageBox support <support@storagebox.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    await transporter.sendMail(emailOptions);

    console.log('Email sent successfully!');
};

module.exports = {
    sendEmail,
};
