const getVerificationEmailTemplate = ({ name, verificationUrl }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Welcome to Task Manager App, ${name}!</h2>
    <p>Please verify your email address to activate your account.</p>
    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p>${verificationUrl}</p>
    <p>This link will expire in 24 hours.</p>
    <p>Best regards,<br>Task Manager Team</p>
  </div>
`;

const getWelcomeEmailTemplate = ({ name, email, phone }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Welcome to Task Manager App, ${name}!</h2>
    <p>Your account has been successfully verified. Here are your registration details:</p>
    <ul>
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Phone:</strong> ${phone}</li>
    </ul>
    <p>Start managing your tasks now!</p>
    <p>Best regards,<br>Task Manager Team</p>
  </div>
`;

const getPasswordResetEmailTemplate = ({ name, resetUrl }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Password Reset Request</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the button below to reset it:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If the button doesn't work, copy and paste this link into your GAMbrowser:</p>
    <p>${resetUrl}</p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>
    <p>Best regards,<br>Task Manager Team</p>
  </div>
`;

module.exports = {
  getVerificationEmailTemplate,
  getWelcomeEmailTemplate,
  getPasswordResetEmailTemplate
};