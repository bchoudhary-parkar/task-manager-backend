import { transporter } from '../config/email.config.js';
import { Verification_Email_Template, Welcome_Email_Template, Temp_Password_Email_Template } from './emailTemplates.js';
export const sendVerificationEmail = async (email, verificationCode) => {
    try {
        const response = await transporter.sendMail({
            from: `"TaskManager" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify Your Email Address",
            html: Verification_Email_Template.replace("{verificationCode}", verificationCode)
        });
        console.log('Verification email sent successfully:', response.messageId);
        return true;
    }
    catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};
export const sendWelcomeEmail = async (email, name) => {
    try {
        const response = await transporter.sendMail({
            from: `"Task Manager" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Welcome to Our Platform!",
            html: Welcome_Email_Template.replace("{name}", name)
        });
        console.log('Welcome email sent successfully:', response.messageId);
        return true;
    }
    catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};
export const sendAdminCreatedUserEmail = async (email, name, tempPassword) => {
    try {
        const html = Temp_Password_Email_Template
            .replace("{name}", name)
            .replace("{email}", email)
            .replace("{tempPassword}", tempPassword);
        await transporter.sendMail({
            from: `"Task Manager" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your New Account Credentials",
            html: html
        });
        return true;
    }
    catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};
//# sourceMappingURL=email.service.js.map