const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
    // CREATE A TRANSPORTER
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        }
    });

    const emailOptions = {
        from: 'Cineflix support <support@cineflix.com>',
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
