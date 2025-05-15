const nodemailer = require('nodemailer');

// Configure the email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // e.g., 'Gmail', 'SendGrid', etc.
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
  });
};

// Send email function
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Task Manager App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendEmail };