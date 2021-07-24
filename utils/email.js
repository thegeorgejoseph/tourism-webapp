const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    // service: 'Gmail', // IF YOU USE GMAIL THEN SELECT LESS SECURE APP OPTION. not a good idea for production level code because it will get marked a spam so use alternative
    // auth: {
    //   user: process.env.EMAIL_USERNAME,
    //   pass: process.env.EMAIL_PASSWORD,
    // },
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'George Joseph <thegeorgejoseph.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //   html:
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
