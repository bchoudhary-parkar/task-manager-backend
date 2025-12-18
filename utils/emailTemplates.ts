export const Verification_Email_Template = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; color: #333; }
    .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; text-align: center; letter-spacing: 8px; margin: 30px 0; padding: 20px; background: #eff6ff; border-radius: 8px; }
    .message { color: #666; line-height: 1.6; margin: 20px 0; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <h2 class="header">Verify Your Email Address</h2>
    <p class="message">Hello,</p>
    <p class="message">Thank you for signing up! Please use the following verification code to complete your registration:</p>
    <div class="otp-code">{verificationCode}</div>
    <p class="message">This code will expire in <strong>10 minutes</strong>.</p>
    <p class="message">If you didn't request this code, please ignore this email.</p>
    <div class="footer">
      <p>This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

export const Welcome_Email_Template = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; color: #2563eb; }
    .message { color: #666; line-height: 1.6; margin: 20px 0; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <h2 class="header">Welcome to Our Platform! 🎉</h2>
    <p class="message">Hello {name},</p>
    <p class="message">Welcome aboard! Your email has been successfully verified.</p>
    <p class="message">You can now access all features of your account and start exploring.</p>
    <p class="message">If you have any questions, feel free to reach out to our support team.</p>
    <div class="footer">
      <p>Thank you for joining us!</p>
    </div>
  </div>
</body>
</html>
`;

// task-manager-backend/utils/emailTemplates.js
export const Temp_Password_Email_Template = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee;">
    <h2 style="color: #2b6cb0;">Account Created</h2>
    <p>Hello {name},</p>
    <p>An administrator has created an account for you. Your login credentials are:</p>
    <div style="background: #f7fafc; padding: 15px; border-radius: 5px;">
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Temporary Password:</strong> <span style="color: #e53e3e; font-family: monospace;">{tempPassword}</span></p>
    </div>
    <p style="margin-top: 20px;">Please login and change your password immediately.</p>
  </div>
`;
