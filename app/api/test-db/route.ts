import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const retry = req.nextUrl.searchParams.get("retry") === "true";
  
  if (retry) {
    // Dynamic Hot-Reload of .env file from disk!
    try {
      const envPath = path.join(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf8");
        const lines = envContent.split("\n");
        for (const line of lines) {
          const match = line.match(/^\s*MONGODB_URI\s*=\s*(.+)$/);
          if (match) {
            let value = match[1].trim();
            if (value.startsWith('"') && value.endsWith('"')) {
              value = value.substring(1, value.length - 1);
            }
            if (value.startsWith("'") && value.endsWith("'")) {
              value = value.substring(1, value.length - 1);
            }
            process.env.MONGODB_URI = value;
            break;
          }
        }
      }
    } catch (envReadError) {
      console.error("Failed to read .env dynamically during retry:", envReadError);
    }

    // Reset caching state
    global.mongooseCache = { conn: null, promise: null };
    global.useMockDatabase = undefined;
    global.mongooseConnectionError = undefined;
  }

  const diagnostics: Record<string, any> = {
    mongodb_uri_exists: false,
    mongodb_uri_masked: "Not found",
    connection_attempted: false,
    connection_successful: false,
    connection_error: null,
    global_use_mock_db: false,
    retry_executed: retry,
  };

  try {
    const rawUri = process.env.MONGODB_URI;
    if (rawUri) {
      diagnostics.mongodb_uri_exists = true;
      // Mask password in diagnostics for security
      diagnostics.mongodb_uri_masked = rawUri.replace(/:([^:@]+)@/, ":******@");
    }

    diagnostics.connection_attempted = true;
    const dbConnection = await connectToDatabase();
    
    if (dbConnection && !global.useMockDatabase) {
      diagnostics.connection_successful = true;
    }
    diagnostics.global_use_mock_db = !!global.useMockDatabase;
    diagnostics.connection_error = global.mongooseConnectionError || null;

    const targetEmails = ["dhirajwarangane@gmail.com", "dhirajwarangane2004@gmail.com"];
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now!
    
    const updatedMongoUsers = [];
    if (diagnostics.connection_successful) {
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
    }

    // Update local db.json fallback database (safely wrapped in try-catch to avoid EROFS crash on Vercel)
    let updatedLocalUsers = [];
    const DB_FILE_PATH = path.join(process.cwd(), "db.json");
    if (fs.existsSync(DB_FILE_PATH)) {
      try {
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
      } catch (localWriteError: any) {
        console.warn("⚠️ [test-db] Swallowing EROFS local write error for Vercel:", localWriteError.message);
        diagnostics.local_db_write_status = `Ignored (Read-only System / Expected on Vercel): ${localWriteError.message}`;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Premium subscription diagnostic executed!",
      mode: diagnostics.global_use_mock_db ? "Mock Database Fallback (db.json)" : "Live MongoDB Atlas Cluster",
      diagnostics,
      mongoUpdated: updatedMongoUsers,
      localUpdated: updatedLocalUsers,
      expiry: expiryDate.toISOString()
    });
  } catch (error: any) {
    diagnostics.connection_error = error.message;
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        diagnostics
      },
      { status: 500 }
    );
  }
}

