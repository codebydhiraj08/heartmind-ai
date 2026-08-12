import nodemailer from "nodemailer";

/**
 * Sends a real transactional email with the password reset/recovery link.
 * Falls back to console simulation if SMTP credentials are not provided.
 */
export async function sendRecoveryEmail(name: string, email: string, resetUrl: string) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");

  const formattedMessage = `Hello ${name},

We received a request to reset your password for your HeartMind AI account.

To reset your password, please click on the link below:

${resetUrl}

This link is valid for 1 hour. If you did not request a password reset, please ignore this email.

— Team HeartMind AI`;

  // HTML formatted version
  const htmlMessage = `
    <p style="font-family: sans-serif; font-size: 15px; color: #333; margin-bottom: 20px;">Hello ${name},</p>
    
    <p style="font-family: sans-serif; font-size: 15px; color: #333; margin-bottom: 24px;">
      We received a request to reset the password for your HeartMind AI account. To reset your password, please click the button below:
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" style="background-color: #8b5cf6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-family: sans-serif; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
    </div>

    <p style="font-family: sans-serif; font-size: 13px; color: #666; margin-bottom: 24px;">
      Or copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #8b5cf6; word-break: break-all;">${resetUrl}</a>
    </p>

    <p style="font-family: sans-serif; font-size: 14px; color: #333;">
      — Team HeartMind AI
    </p>
  `;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for 587
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"HeartMind AI" <${smtpUser}>`,
        to: email.toLowerCase(),
        subject: "Reset your HeartMind AI password",
        text: formattedMessage,
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #8b5cf6; padding-bottom: 16px;">
              <h2 style="font-family: sans-serif; color: #8b5cf6; margin: 0;">HeartMind.ai</h2>
            </div>
            ${htmlMessage}
          </div>
        `,
      });

      console.log(`\n✅ REAL RECOVERY EMAIL DELIVERED successfully to ${email.toLowerCase()} via ${smtpHost}!\n`);
    } catch (error: any) {
      console.error("\n❌ FAILED TO SEND REAL RECOVERY EMAIL via SMTP:", error.message);
      console.log("Falling back to console simulation...\n");
      logConsoleSimulation(name, email, resetUrl);
    }
  } else {
    logConsoleSimulation(name, email, resetUrl);
    console.log("📢 TO SEND REAL EMAILS: Add SMTP_USER and SMTP_PASS to your .env file!");
  }
}

function logConsoleSimulation(name: string, email: string, resetUrl: string) {
  console.log("\n=======================================================");
  console.log("📧 DEVELOPMENT PASSWORD RESET REQUEST (SIMULATED) 📧");
  console.log(`User: ${name} (${email})`);
  console.log(`Link: ${resetUrl}`);
  console.log("=======================================================\n");
}
