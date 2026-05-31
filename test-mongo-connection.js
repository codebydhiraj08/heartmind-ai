const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

function getMongoUri() {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/^MONGODB_URI=(.+)$/m);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

async function test() {
  const uri = getMongoUri();
  if (!uri) {
    console.error("❌ No MONGODB_URI found in .env");
    process.exit(1);
  }

  console.log(`🔌 Attempting to connect to MongoDB Atlas with URI: ${uri}`);
  try {
    await mongoose.connect(uri, {
      bufferCommands: false,
    });
    console.log("✅ Successfully connected to MongoDB Atlas!");
    
    // Check if we can do a simple ping
    const admin = mongoose.connection.db.admin();
    const info = await admin.ping();
    console.log("✅ Ping successful:", info);
    
    await mongoose.disconnect();
    console.log("🔌 Disconnected cleanly.");
  } catch (error) {
    console.error("❌ Connection failed with error:");
    console.error(error);
  }
}

test();
