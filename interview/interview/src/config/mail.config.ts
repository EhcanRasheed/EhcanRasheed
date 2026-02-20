import * as dotenv from 'dotenv';
dotenv.config();

export const mailConfig = {
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.MAIL_PORT) || 587,
  user: process.env.MAIL_USER || 'ai.interviewer02@gmail.com', // Updated fallback
  pass: process.env.MAIL_PASS || '',
  from: process.env.MAIL_FROM_EMAIL || 'ai.interviewer02@gmail.com', // Updated fallback
  fromName: process.env.MAIL_FROM_NAME || 'HireCraft: Interview Preparation App', // Updated fallback
};