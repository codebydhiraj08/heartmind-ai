import nodemailer from "nodemailer";

export const welcomeMessages = [
  // Version A
  `Hello [NAME],

Welcome to HeartMind AI.

Your account has been successfully created, verified, and secured within our intelligent ecosystem.

HeartMind AI is not just another relationship platform.
We are building an advanced AI-powered relationship intelligence system designed to help people understand emotions, communication patterns, compatibility, trust, attachment behavior, and human connection on a deeper level.

By combining artificial intelligence with emotional intelligence, our mission is to create a future where relationships become more self-aware, meaningful, and emotionally connected.

Inside HeartMind AI, you’ll gain access to intelligent insights, behavioral analysis, emotional pattern recognition, and personalized AI-driven guidance designed to help improve understanding between people.

This is more than an application.
This is the beginning of a new generation of relationship technology.

We’re excited to have you as part of the HeartMind AI journey.

Welcome aboard.

— Team HeartMind AI`,

  // Version B
  `Hello [NAME],

Welcome to HeartMind AI.

Your account has been successfully created, verified, and secured within our intelligent ecosystem.

HeartMind AI is not just another relationship platform.
We are building an advanced AI-powered relationship intelligence system designed to help people understand emotions, communication patterns, compatibility, trust, attachment behavior, and human connection on a deeper level.

By combining artificial intelligence with emotional intelligence, our mission is to create a future where relationships become more self-aware, meaningful, and emotionally connected.

Inside HeartMind AI, you’ll gain access to intelligent insights, behavioral analysis, emotional pattern recognition, and personalized AI-driven guidance designed to help improve understanding between people.

This is more than an application.
This is the beginning of a new generation of relationship technology.

We’re excited to have you as part of the HeartMind AI journey.

Welcome aboard.

— Team HeartMind AI`
];

/**
 * Sends a real transactional welcome email to the user if SMTP credentials are provided in .env.
 * Otherwise, logs it beautifully in the development console with instructions.
 */
export async function sendWelcomeEmail(name: string, email: string) {
  // Use character code of the email to alternate between the templates stably
  const index = email.toLowerCase().charCodeAt(0) % 2;
  const template = welcomeMessages[index];
  const formattedMessage = template.replace("[NAME]", name);

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");

  // Format plaintext message to simple HTML paragraphs so it looks elegant in the inbox!
  const htmlMessage = formattedMessage
    .split("\n\n")
    .map(para => `<p style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #333333; margin-bottom: 16px;">${para.replace(/\n/g, "<br>")}</p>`)
    .join("");

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
        subject: "Welcome to HeartMind AI - Your Account is Secured",
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

      console.log(`\n✅ REAL WELCOME EMAIL DELIVERED successfully to ${email.toLowerCase()} via ${smtpHost}!\n`);
    } catch (error: any) {
      console.error("\n❌ FAILED TO SEND REAL EMAIL via SMTP:", error.message);
      console.log("Falling back to console simulation...\n");
      logConsoleSimulation(name, email, index, formattedMessage);
    }
  } else {
    // If SMTP keys are missing, log with clear instructions for the user on how to enable real sending!
    logConsoleSimulation(name, email, index, formattedMessage);
    console.log("📢 TO SEND REAL EMAILS: Add SMTP_USER and SMTP_PASS (e.g. Gmail App Password) to your .env file!");
  }
}

function logConsoleSimulation(name: string, email: string, index: number, message: string) {
  console.log("\n=======================================================");
  console.log("📨 SENT TRANSACTIONAL WELCOME EMAIL (DEV MODE) 📨");
  console.log(`To: ${name} (${email.toLowerCase()})`);
  console.log(`Template Alternate: Version ${index === 0 ? "A" : "B"}`);
  console.log("-------------------------------------------------------");
  console.log(message);
  console.log("=======================================================\n");
}
