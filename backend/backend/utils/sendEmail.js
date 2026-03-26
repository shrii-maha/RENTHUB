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
    console.log('[EMAIL] SUCCESS: Message sent to %s (ID: %s)', options.email, info.messageId);
  } catch (error) {
    console.error('[EMAIL] CRITICAL ERROR: Could not send email via SMTP.');
    console.error(`[EMAIL] REASON: ${error.message}`);
    console.warn('[EMAIL] ACTION REQUIRED: Check if Google App Password is correct in Render Env Vars.');
    
    console.log(`=== SIMULATED EMAIL TO: ${options.email} ===`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log(`=================================================`);
  }
};

module.exports = sendEmail;
