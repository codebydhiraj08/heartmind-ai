import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");

  const diagnostics: any = {
    smtpUser: smtpUser ? `${smtpUser.slice(0, 3)}...${smtpUser.slice(-3)}` : "MISSING",
    smtpPass: smtpPass ? "PRESENT (hidden)" : "MISSING",
    smtpHost,
    smtpPort,
    connectionStatus: "Not tested",
    logs: [],
  };

  diagnostics.logs.push("Starting live SMTP diagnostics on Vercel...");

  if (!smtpUser || !smtpPass) {
    diagnostics.connectionStatus = "Failed (Missing environment variables)";
    diagnostics.logs.push("ERROR: SMTP_USER or SMTP_PASS is not defined in Vercel environment variables!");
    return NextResponse.json(diagnostics, { status: 400 });
  }

  try {
    diagnostics.logs.push("Creating transporter...");
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      // Timeout settings to prevent hanging in serverless environments
      connectionTimeout: 10000, 
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    diagnostics.logs.push("Verifying transporter connection...");
    await transporter.verify();
    diagnostics.logs.push("✅ Connection verified successfully!");

    diagnostics.logs.push("Attempting to send self-test email...");
    const info = await transporter.sendMail({
      from: `"HeartMind AI Diagnostics" <${smtpUser}>`,
      to: smtpUser,
      subject: "HeartMind AI Live Vercel SMTP Test",
      text: "Verification connection confirmed from live Vercel environment!",
      html: "<p>Verification connection confirmed from live Vercel environment!</p>",
    });

    diagnostics.connectionStatus = "Success (Email sent)";
    diagnostics.messageId = info.messageId;
    diagnostics.logs.push(`✅ Email sent successfully! Message ID: ${info.messageId}`);
    return NextResponse.json(diagnostics, { status: 200 });

  } catch (error: any) {
    diagnostics.connectionStatus = "Failed";
    diagnostics.logs.push(`❌ SMTP Error occurred: ${error.message}`);
    if (error.code) diagnostics.errorCode = error.code;
    if (error.response) diagnostics.smtpResponse = error.response;
    return NextResponse.json(diagnostics, { status: 500 });
  }
}
