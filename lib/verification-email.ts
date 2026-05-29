import nodemailer from "nodemailer";

/**
 * Sends a real transactional email with the verification link.
 * Falls back to console simulation if SMTP credentials are not provided.
 */
export async function sendVerificationEmail(name: string, email: string, verifyUrl: string) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");

  const formattedMessage = `Hello ${name},

Welcome to HeartMind AI.

To ensure the security of your account and activate your relationship intelligence suite, please verify your email address by clicking the link below:

${verifyUrl}

This link will expire soon for your protection. If you did not create this account, please ignore this email.

— Team HeartMind AI`;

  // HTML formatted version
  const htmlMessage = `
    <p style="font-family: sans-serif; font-size: 15px; color: #333; margin-bottom: 20px;">Hello ${name},</p>
    
    <p style="font-family: sans-serif; font-size: 15px; color: #333; margin-bottom: 24px;">
      Welcome to HeartMind AI. To ensure the security of your account and activate your relationship intelligence suite, please verify your email address by clicking the button below:
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${verifyUrl}" style="background-color: #e72a6b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-family: sans-serif; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email Address</a>
    </div>

    <p style="font-family: sans-serif; font-size: 13px; color: #666; margin-bottom: 24px;">
      Or copy and paste this link into your browser:<br>
      <a href="${verifyUrl}" style="color: #e72a6b; word-break: break-all;">${verifyUrl}</a>
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
        subject: "Verify your HeartMind AI account",
        text: formattedMessage,
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #e72a6b; padding-bottom: 16px;">
              <h2 style="font-family: sans-serif; color: #e72a6b; margin: 0;">HeartMind.ai</h2>
            </div>
            ${htmlMessage}
          </div>
        `,
      });

      console.log(`\n✅ REAL VERIFICATION EMAIL DELIVERED successfully to ${email.toLowerCase()} via ${smtpHost}!\n`);
    } catch (error: any) {
      console.error("\n❌ FAILED TO SEND REAL VERIFICATION EMAIL via SMTP:", error.message);
      console.log("Falling back to console simulation...\n");
      logConsoleSimulation(name, email, verifyUrl);
    }
  } else {
    logConsoleSimulation(name, email, verifyUrl);
    console.log("📢 TO SEND REAL EMAILS: Add SMTP_USER and SMTP_PASS (e.g. Gmail App Password) to your .env file!");
  }
}

function logConsoleSimulation(name: string, email: string, verifyUrl: string) {
  console.log("\n=======================================================");
  console.log("📧 DEVELOPMENT EMAIL VERIFICATION FOR NEW USER 📧");
  console.log(`User: ${name} (${email})`);
  console.log(`Link: ${verifyUrl}`);
  console.log("=======================================================\n");
}
