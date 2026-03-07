import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  public async sendGenericMail(to: string, subject: string, html: string) {
    return this.sendMail(to, subject, html);
  }

  private async sendMail(to: string, subject: string, html: string) {
    try {
      await this.resend.emails.send({
        from: 'Hire-Craft <noreply@hire-craft.app>',
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Sends the 6-digit OTP code for registration verification
   */
  async sendOtpEmail(email: string, name: string, otp: string): Promise<void> {
    const html = `
      <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #007bff; text-align: center;">Welcome to Hire-Craft!</h2>
          <p>Hello <b>${name}</b>,</p>
          <p>Thank you for choosing Hire-Craft for your interview preparation. Please use the following One-Time Password (OTP) to verify your account:</p>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #007bff; border: 2px dashed #007bff; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code is valid for <b>10 minutes</b>. For security reasons, please do not share this code with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">If you did not request this verification, please ignore this email.</p>
        </div>
      </body>
      </html>
    `;

    await this.sendMail(email, 'Your Hire-Craft Verification Code', html);
  }

  /**
   * Sends a password reset link
   */
/**
   * Sends a password reset link
   */
  async sendPasswordReset(email: string, name: string, tokenOrLink: string): Promise<void> {
    // If the string already starts with http, it's already a full link. 
    // Otherwise, we build it.
    const resetLink = tokenOrLink.startsWith('http') 
      ? tokenOrLink 
      : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${tokenOrLink}`;

    const html = `
      <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Password Reset Request</h2>
        <p>Hello ${name}, click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background:#dc3545; color:#fff; padding:12px 25px; border-radius:5px; text-decoration:none; display:inline-block; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p style="font-size: 11px; color: #888;">If the button doesn't work, copy and paste this link: <br/> ${resetLink}</p>
      </body>
      </html>
    `;

    await this.sendMail(email, 'Reset Your Hire-Craft Password', html);
  }

  /**
   * Sends a welcome email after the user is successfully verified
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <html>
      <body style="font-family: Arial, sans-serif;">
        <h2 style="color: #28a745;">Registration Verified!</h2>
        <p>Hello ${name},</p>
        <p>Your Hire-Craft account is now fully active. You can now log in and access all our AI-powered interview tools.</p>
        <p>Best of luck with your preparation!</p>
      </body>
      </html>
    `;

    await this.sendMail(email, 'Welcome to Hire-Craft', html);
  }

  /**
   * Backwards compatibility for the activation token flow
   */
  async sendAccountActivation(email: string, name: string, token: string): Promise<void> {
    await this.sendOtpEmail(email, name, token); 
  }
}