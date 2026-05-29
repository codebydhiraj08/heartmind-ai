import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const targetEmails = ["dhirajwarangane@gmail.com", "dhirajwarangane2004@gmail.com"];
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now!
    
    const updatedMongoUsers = [];
    for (const email of targetEmails) {
      const u = await User.findOne({ email: email.toLowerCase() });
      if (u) {
        u.subscriptionTier = "premium";
        u.subscriptionStatus = "active";
        u.currentPlan = "premium";
        u.trialStartedAt = new Date();
        u.trialExpiresAt = expiryDate;
        u.trialActivatedAt = new Date();
        u.hasUsedTrial = true;
        u.premiumAccessSource = "subscription";
        u.subscriptionExpiresAt = expiryDate;
        await u.save();
        updatedMongoUsers.push(email);
      }
    }

    // Also update local db.json fallback database
    let updatedLocalUsers = [];
    const DB_FILE_PATH = path.join(process.cwd(), "db.json");
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, "utf8");
      const users = JSON.parse(data || "[]");
      let modified = false;
      for (const u of users) {
        if (targetEmails.includes(u.email?.toLowerCase())) {
          u.subscriptionTier = "premium";
          u.subscriptionStatus = "active";
          u.currentPlan = "premium";
          u.trialStartedAt = new Date().toISOString();
          u.trialExpiresAt = expiryDate.toISOString();
          u.trialActivatedAt = new Date().toISOString();
          u.hasUsedTrial = true;
          u.premiumAccessSource = "subscription";
          u.subscriptionExpiresAt = expiryDate.toISOString();
          updatedLocalUsers.push(u.email);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(users, null, 2));
      }
    }

    return NextResponse.json({
      success: true,
      message: "Premium subscription successfully activated for 7 days!",
      mode: global.useMockDatabase ? "Mock Database Fallback (db.json)" : "Live MongoDB Atlas Cluster",
      mongoUpdated: updatedMongoUsers,
      localUpdated: updatedLocalUsers,
      expiry: expiryDate.toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
