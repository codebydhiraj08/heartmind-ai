const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Manually parse .env file to prevent "dotenv missing" issues
try {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    envFile.split("\n").forEach(line => {
      // Ignore comments
      if (line.trim().startsWith("#")) return;
      const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        // Strip quotes
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val.trim();
      }
    });
  }
} catch (e) {
  console.error("Failed to parse .env file manually:", e.message);
}

async function testSMTP() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");

  console.log("=========================================");
  console.log("🔍 TESTING SMTP EMAIL CONNECTION LOCAL 🔍");
  console.log("=========================================");
  console.log(`SMTP Host: ${smtpHost}`);
  console.log(`SMTP Port: ${smtpPort}`);
  console.log(`SMTP User: ${smtpUser}`);
  console.log(`SMTP Pass: ${smtpPass ? "***hidden***" : "MISSING!"}`);

  if (!smtpUser || !smtpPass) {
    console.error("❌ ERROR: SMTP_USER or SMTP_PASS is missing in your manually parsed env!");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    console.log("\n⏳ Verifying connection with SMTP Server...");
    await transporter.verify();
    console.log("✅ SUCCESS: Transporter connection verified! Credentials are 100% correct.");

    console.log("\n⏳ Sending test email to SMTP_USER...");
    const info = await transporter.sendMail({
      from: `"HeartMind AI Test" <${smtpUser}>`,
      to: smtpUser,
      subject: "HeartMind AI SMTP Test Email",
      text: "This is a direct test email to verify that your Nodemailer SMTP settings work 100%!",
      html: "<p>This is a direct test email to verify that your <b>Nodemailer SMTP settings work 100%!</b></p>",
    });

    console.log("✅ SUCCESS: Test email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("\n❌ SMTP CONNECTION OR SEND FAILURE:", error);
  }
}

testSMTP();
