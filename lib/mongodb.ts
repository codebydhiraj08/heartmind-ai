import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global scope in TypeScript to support cached connections
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
  // eslint-disable-next-line no-var
  var useMockDatabase: boolean | undefined;
  // eslint-disable-next-line no-var
  var mongooseConnectionError: string | undefined;
}

const cached = global.mongooseCache || (global.mongooseCache = { conn: null, promise: null });

export async function connectToDatabase() {
  let MONGODB_URI = process.env.MONGODB_URI;

  // Clean MONGODB_URI from any accidental copy-paste prefixes (like MONGODB_URI=) or quotes
  if (MONGODB_URI) {
    MONGODB_URI = MONGODB_URI.trim();
    if (MONGODB_URI.startsWith("MONGODB_URI=")) {
      MONGODB_URI = MONGODB_URI.substring("MONGODB_URI=".length).trim();
    }
    if (MONGODB_URI.startsWith('"') && MONGODB_URI.endsWith('"')) {
      MONGODB_URI = MONGODB_URI.substring(1, MONGODB_URI.length - 1).trim();
    }
    if (MONGODB_URI.startsWith("'") && MONGODB_URI.endsWith("'")) {
      MONGODB_URI = MONGODB_URI.substring(1, MONGODB_URI.length - 1).trim();
    }
  }

  // If MONGODB_URI is not set, or still has placeholder text, trigger mock fallback
  if (!MONGODB_URI || MONGODB_URI.includes("<username>") || MONGODB_URI.includes("<password>") || MONGODB_URI.includes("<db_password>")) {
    console.warn("\n⚠️ [HEARTMIND] Using Local JSON File Fallback Database (No valid MONGODB_URI found in .env).");
    global.mongooseConnectionError = !MONGODB_URI 
      ? "MONGODB_URI is missing or empty in your environment settings / .env file." 
      : "Placeholder detected (<username>, <password>, or <db_password>). Please replace these with your actual MongoDB credentials in your .env file.";
    global.useMockDatabase = true;
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("\n🔌 [HEARTMIND] Connecting to MongoDB Atlas...");
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("✅ [HEARTMIND] Connected to MongoDB Atlas successfully!");
      global.mongooseConnectionError = undefined; // Clear cached error on success
      return mongooseInstance;
    }).catch((err) => {
      console.error("\n⚠️ [HEARTMIND] MongoDB connection failed:", err.message);
      global.mongooseConnectionError = err.message; // Cache connection error message
      console.warn("⚠️ [HEARTMIND] Automatically falling back to local JSON file database for offline development.\n");
      global.useMockDatabase = true;
      return null as any; // Resolve with null to let the server continue
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    global.useMockDatabase = true;
    return null;
  }

  return cached.conn;
}

