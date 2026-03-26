const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Email could not be sent, possibly due to missing credentials. Simulating email instead...');
    console.log(`=== SIMULATED EMAIL TO: ${options.email} ===`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log(`=================================================`);
  }
};

module.exports = sendEmail;
