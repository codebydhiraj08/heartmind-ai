const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const DB_FILE_PATH = path.join(process.cwd(), "db.json");
const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  const targetEmails = ["dhirajwarangane@gmail.com", "dhirajwarangane2004@gmail.com"];
  const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now!

  console.log("Starting Premium Reactivation...");
  console.log("Target emails:", targetEmails);
  console.log("Expiration date:", expiryDate);

  // 1. Update local db.json
  if (fs.existsSync(DB_FILE_PATH)) {
    console.log("Found db.json, updating...");
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
          console.log(`Updated local db.json for: ${u.email}`);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(users, null, 2));
        console.log("Successfully wrote updates to db.json");
      } else {
        console.log("No matching users found in db.json to update.");
      }
    } catch (e) {
      console.error("Error updating local db.json:", e);
    }
  } else {
    console.log("db.json not found.");
  }

  // 2. Update MongoDB Atlas if URI is available
  if (MONGODB_URI) {
    console.log("Connecting to MongoDB Atlas...");
    try {
      await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log("Connected successfully!");

      const db = mongoose.connection.db;
      const usersCollection = db.collection("users");

      for (const email of targetEmails) {
        const u = await usersCollection.findOne({ email: email.toLowerCase() });
        if (u) {
          const result = await usersCollection.updateOne(
            { email: email.toLowerCase() },
            {
              $set: {
                subscriptionTier: "premium",
                subscriptionStatus: "active",
                currentPlan: "premium",
                trialStartedAt: new Date(),
                trialExpiresAt: expiryDate,
                trialActivatedAt: new Date(),
                hasUsedTrial: true,
                premiumAccessSource: "subscription",
                subscriptionExpiresAt: expiryDate,
              }
            }
          );
          console.log(`MongoDB Update result for ${email}:`, result);
        } else {
          console.log(`User with email ${email} not found in MongoDB.`);
        }
      }
    } catch (e) {
      console.error("Error updating MongoDB Atlas:", e);
    } finally {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB.");
    }
  } else {
    console.log("No MONGODB_URI in environment variables.");
  }
}

run();
