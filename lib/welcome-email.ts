import nodemailer from "nodemailer";

// Beautiful, short and high-converting templates for A/B testing
export const welcomeMessages = [
  // Version A: Rich & Empathetic
  `Hello [NAME],

Welcome to the future of understanding relationships.

HeartMind AI is now ready to assist you. Whether you want to decode complex communication, understand attachment styles, or improve daily compatibility, our AI-powered emotional intelligence is here to guide you.

Our platform blends cutting-edge artificial intelligence with deep human psychology to help you uncover attachment behavior, spot emotional cycles, and build more meaningful connection patterns with the people who matter most.

We're excited to be part of your relationship journey.

— Team HeartMind AI`,

  // Version B: Sleek, Feature & Action-Oriented
  `Hello [NAME],

Welcome to HeartMind AI!

Your relationship intelligence space is fully active. Together, we will help you understand trust levels, attachment dynamics, and emotional patterns to build a deeper, more self-aware, and meaningful connection.

Here is what you can do right now inside your workspace:
• Chat Tone Analysis: Uncover emotional frequencies and subtexts from your communications.
• Tailored Coach Insights: Receive customized exercises based on your specific attachment styles.
• Compatibility Mapping: Track attachment behavior and grow stronger bonds.

Here's to a more self-aware relationship.

— Team HeartMind AI`,

  // Version C: Inspirational & Growth-Oriented
  `Hello [NAME],

Welcome to HeartMind AI!

We believe that the quality of our lives is determined by the quality of our connections. HeartMind AI was created to give you the psychological maps and communication tools needed to bridge gaps, deepen empathy, and nurture trust.

From real-time chat insights to personalized bonding goals, our system acts as your personal relationship co-pilot. We are excited to support you as you build a stronger, more emotionally aligned partnership.

Let's grow together.

— Team HeartMind AI`,

  // Version D: Structured Checklist & Actionable
  `Hello [NAME],

Welcome to HeartMind AI!

Your account has been successfully set up, and your personal relationship workspace is fully active. Let's make sure you get the most out of your first week:

1. Try out the Chat Analyzer to see hidden subtexts in your messages.
2. Select your Preferred Coach Tone in settings for customized feedback.
3. Explore the Compatibility Insights to understand attachment dynamics.

We are thrilled to accompany you on this journey of self-discovery and relationship building.

— Team HeartMind AI`,

  // Version E: Direct & Empowering
  `Hello [NAME],

Welcome to HeartMind AI.

Understanding each other doesn't have to be a guessing game. By combining emotional intelligence with advanced AI analysis, we help you translate complex attachment styles, daily habits, and communication patterns into actionable, trust-building insights.

Your personal dashboard is completely set up and ready to use. Step in, customize your experience, and start building more conscious, resilient connections today.

The future of your connection starts here.

— Team HeartMind AI`
];

/**
 * Sends a real transactional welcome email to the user if SMTP credentials are provided in .env.
 * Otherwise, logs it beautifully in the development console with instructions.
 */
export async function sendWelcomeEmail(name: string, email: string) {
  // Choose one of the welcome templates completely at random for full variety
  const index = Math.floor(Math.random() * welcomeMessages.length);
  const template = welcomeMessages[index];
  const formattedMessage = template.replace("[NAME]", name);

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");

  // Build a highly premium and modern responsive HTML layout
  const nextAuthUrl = process.env.NEXTAUTH_URL || "https://heartmind-ai-eby3.vercel.app";
  const dashboardUrl = `${nextAuthUrl}/dashboard`;

  // Render HTML message based on which template is active
  const mainParagraphs = formattedMessage
    .split("\n\n")
    .filter(para => !para.startsWith("—")) // Exclude signature for now to place it after CTA
    .map(para => `<p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #374151; margin: 0 0 16px 0;">${para.replace(/\n/g, "<br>")}</p>`)
    .join("");

  const signaturePara = `<p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; color: #1f2937; margin: 24px 0 0 0;">— Team HeartMind AI</p>`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to HeartMind AI</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; -webkit-text-size-adjust: none; text-size-adjust: none;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02); border: 1px solid #e5e7eb;">
                <!-- Header with Brand Logo -->
                <tr>
                  <td style="background-color: #ffffff; padding: 24px; text-align: center; border-bottom: 1px solid #f3f4f6;">
                    <a href="${nextAuthUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="${nextAuthUrl}/logo.png" alt="HeartMind AI" width="220" style="display: block; border: 0; max-width: 220px; height: auto; margin: 0 auto;" />
                    </a>
                  </td>
                </tr>
                <!-- Body Content -->
                <tr>
                  <td style="padding: 36px 32px 32px 32px;">
                    ${mainParagraphs}
                    
                    <!-- Call To Action Button -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                      <tr>
                        <td align="center">
                          <a href="${dashboardUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #e72a6b 0%, #a855f7 100%); color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(231, 42, 107, 0.3); letter-spacing: 0.2px; text-transform: uppercase;">Open Your Dashboard</a>
                        </td>
                      </tr>
                    </table>

                    ${signaturePara}
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #f3f4f6;">
                    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #9ca3af; margin: 0; line-height: 1.5;">
                      &copy; 2026 HeartMind AI. All rights reserved.<br>
                      Building the future of empathetic relationship technology.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
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
        subject: "Welcome to HeartMind AI - Your Account is Secured",
        text: formattedMessage,
        html: htmlBody,
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
  console.log(`Template Alternate: Version ${String.fromCharCode(65 + index)}`);
  console.log("-------------------------------------------------------");
  console.log(message);
  console.log("=======================================================\n");
}
