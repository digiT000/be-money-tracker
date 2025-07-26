import { createTransport } from 'nodemailer';

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: 'fareldeksano000@gmail.com',
    pass: process.env.GOOGLE_APP_PASSWORD, // Use App Passwords for Gmail
  },
});

export default transporter;
export { transporter as nodemailerTransporter };
// This code sets up a Nodemailer transporter using OAuth2 for authentication with Gmail.
