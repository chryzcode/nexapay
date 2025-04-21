import axios, { AxiosError } from "axios";

/**
 * Send a generic email via Brevo SMTP HTTP API
 */
export async function sendEmail(to: string, subject: string, htmlContent: string) {
  const API_KEY = process.env.BREVO_API_KEY as string; // Set your Brevo API Key in .env
  const senderEmail = process.env.SENDER_EMAIL as string;   // Must be a verified Brevo sender

  const payload = {
    sender: { name: "NexaPay", email: senderEmail },
    to: [{ email: to }],
    subject,
    htmlContent,
  };

  try {
    await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json",
      },
    });
    console.log("Email sent successfully via Brevo");
  } catch (error: any) {
    if (error instanceof AxiosError) {
      console.error("Error sending email:", error.response?.data || error);
    }
    throw new Error("Error sending email");
  }
}

/**
 * Send a verification email via Brevo SMTP HTTP API
 */
export async function sendVerificationEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  const htmlContent = `
    <p>Thank you for registering on NexaPay. Please verify your email by clicking the link below:</p>
    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    <p>If you did not sign up, please ignore this email.</p>
  `;
  await sendEmail(to, "Verify your NexaPay account", htmlContent);
}
