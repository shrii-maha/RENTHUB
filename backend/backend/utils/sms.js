const twilio = require('twilio');

const sendSMS = async (to, body) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log('Twilio credentials not found. Simulated SMS body:');
    console.log(`To: ${to}`);
    console.log(`Body: ${body}`);
    return;
  }

  const client = twilio(accountSid, authToken);

  try {
    await client.messages.create({
      body,
      from: fromNumber,
      to: to.startsWith('+') ? to : `+91${to}` // Defaulting to +91 for India if no prefix
    });
    console.log(`SMS successfully sent to ${to}`);
  } catch (error) {
    console.error('Error sending SMS via Twilio:', error.message);
    throw new Error('Failed to send verification SMS');
  }
};

module.exports = sendSMS;
