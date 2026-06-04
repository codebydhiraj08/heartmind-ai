import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  birthdate?: string;
  age?: number;
  coachTone?: string;
  partnerName?: string;
  relationshipStatus?: string;
  anniversaryDate?: string;
  tipsEnabled?: boolean;
  analysisAlerts?: boolean;
  marketingEmails?: boolean;
  banterLevel?: "low" | "medium" | "high";
  conflictBaseline?: "calm" | "expressive" | "heated";
  emailVerified: Date | null;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpire?: Date | null;
  createdAt: Date;
  updatedAt?: Date;
  subscriptionTier: "free" | "pro" | "premium";
  subscriptionStatus: "active" | "canceled" | "past_due" | "unpaid" | "incomplete" | "none";
  paymentProvider: "stripe" | "razorpay" | "none";
  billingRegion: string;
  currency: "INR" | "USD";
  customerId?: string;
  subscriptionId?: string;
  subscriptionExpiresAt?: Date | null;
  freeAnalysisUsed: boolean;
  monthlyAnalysisCount: number;
  lastUsageResetAt: Date;
  // Premium Trial model refactoring fields
  trialStartedAt?: Date | null;
  trialExpiresAt?: Date | null;
  trialActivatedAt?: Date | null;
  hasUsedTrial: boolean;
  currentPlan: "free" | "trial" | "pro" | "premium";
  premiumAccessSource: "trial" | "subscription" | "none";
  signupIp?: string;
  lastKnownIp?: string;
  /** SHA-256 hash ONLY. Raw fingerprint payloads are NEVER persisted. */
  signupDeviceFingerprint?: string;
  trialAnalysesCount?: number;
  trialFeaturesEngaged?: string[];
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // Optional for Google OAuth users
    },
    image: {
      type: String,
    },
    birthdate: {
      type: String,
      default: "",
    },
    age: {
      type: Number,
      default: null,
    },
    coachTone: {
      type: String,
      default: "empathetic",
    },
    partnerName: {
      type: String,
      default: "",
    },
    relationshipStatus: {
      type: String,
      default: "dating",
    },
    anniversaryDate: {
      type: String,
      default: "",
    },
    tipsEnabled: {
      type: Boolean,
      default: true,
    },
    analysisAlerts: {
      type: Boolean,
      default: true,
    },
    marketingEmails: {
      type: Boolean,
      default: false,
    },
    banterLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    conflictBaseline: {
      type: String,
      enum: ["calm", "expressive", "heated"],
      default: "calm",
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    subscriptionTier: {
      type: String,
      enum: ["free", "pro", "premium"],
      default: "free",
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "canceled", "past_due", "unpaid", "incomplete", "none"],
      default: "none",
    },
    paymentProvider: {
      type: String,
      enum: ["stripe", "razorpay", "none"],
      default: "none",
    },
    billingRegion: {
      type: String,
      default: "US",
    },
    currency: {
      type: String,
      enum: ["INR", "USD"],
      default: "USD",
    },
    customerId: {
      type: String,
      default: "",
    },
    subscriptionId: {
      type: String,
      default: "",
    },
    subscriptionExpiresAt: {
      type: Date,
      default: null,
    },
    freeAnalysisUsed: {
      type: Boolean,
      default: false,
    },
    monthlyAnalysisCount: {
      type: Number,
      default: 0,
    },
    lastUsageResetAt: {
      type: Date,
      default: () => new Date(),
    },
    trialStartedAt: {
      type: Date,
      default: null,
    },
    trialExpiresAt: {
      type: Date,
      default: null,
    },
    trialActivatedAt: {
      type: Date,
      default: null,
    },
    hasUsedTrial: {
      type: Boolean,
      default: false,
    },
    currentPlan: {
      type: String,
      enum: ["free", "trial", "pro", "premium"],
      default: "free",
    },
    premiumAccessSource: {
      type: String,
      enum: ["trial", "subscription", "none"],
      default: "none",
    },
    signupIp: {
      type: String,
      default: "",
    },
    lastKnownIp: {
      type: String,
      default: "",
    },
    signupDeviceFingerprint: {
      // PRIVACY: Only irreversible SHA-256 hashes are stored here.
      // Raw device fingerprint payloads are NEVER persisted.
      type: String,
      default: "",
    },
    trialAnalysesCount: {
      type: Number,
      default: 0,
    },
    trialFeaturesEngaged: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent Next.js hot-reloading from compiling the model multiple times
const RealUser: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

// ==========================================
// 🛡️ LOCAL JSON FILE FALLBACK DATABASE SYSTEM
// ==========================================
import fs from "fs";
import path from "path";

const DB_FILE_PATH = path.join(process.cwd(), "db.json");

// Helper to read users from db.json safely
function readLocalUsers(): any[] {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(DB_FILE_PATH, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Failed to read local fallback DB:", err);
    return [];
  }
}

// Helper to write users to db.json safely
function writeLocalUsers(users: any[]) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Failed to write to local fallback DB:", err);
  }
}

// Mock User Document class which mimics Mongoose's Document class structure (.save(), timestamps, _id)
class MockUserDocument {
  _id: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  birthdate?: string;
  age?: number;
  coachTone?: string;
  partnerName?: string;
  relationshipStatus?: string;
  anniversaryDate?: string;
  tipsEnabled?: boolean;
  analysisAlerts?: boolean;
  marketingEmails?: boolean;
  banterLevel?: "low" | "medium" | "high";
  conflictBaseline?: "calm" | "expressive" | "heated";
  emailVerified: Date | null;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpire?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptionTier: "free" | "pro" | "premium";
  subscriptionStatus: "active" | "canceled" | "past_due" | "unpaid" | "incomplete" | "none";
  paymentProvider: "stripe" | "razorpay" | "none";
  billingRegion: string;
  currency: "INR" | "USD";
  customerId: string;
  subscriptionId: string;
  subscriptionExpiresAt: Date | null;
  freeAnalysisUsed: boolean;
  monthlyAnalysisCount: number;
  lastUsageResetAt: Date;
  // Refined Premium Trial fields
  trialStartedAt: Date | null;
  trialExpiresAt: Date | null;
  trialActivatedAt: Date | null;
  hasUsedTrial: boolean;
  currentPlan: "free" | "trial" | "pro" | "premium";
  premiumAccessSource: "trial" | "subscription" | "none";
  signupIp: string;
  lastKnownIp: string;
  signupDeviceFingerprint: string;
  trialAnalysesCount: number;
  trialFeaturesEngaged: string[];

  // Relational arrays
  chatAnalyses: any[];
  timelineMemories: any[];
  compatibilities: any[];
  emotionalReports: any[];

  constructor(data: any) {
    this._id = data._id || data.id || Math.random().toString(36).substring(2, 15);
    this.name = data.name;
    this.email = data.email?.toLowerCase();
    this.password = data.password;
    this.image = data.image || "";
    this.birthdate = data.birthdate || "";
    this.age = typeof data.age === "number" ? data.age : (data.age ? parseInt(data.age) : undefined);
    this.coachTone = data.coachTone || "empathetic";
    this.partnerName = data.partnerName || "";
    this.relationshipStatus = data.relationshipStatus || "dating";
    this.anniversaryDate = data.anniversaryDate || "";
    this.tipsEnabled = data.tipsEnabled !== false && data.tipsEnabled !== "false";
    this.analysisAlerts = data.analysisAlerts !== false && data.analysisAlerts !== "false";
    this.marketingEmails = data.marketingEmails === true || data.marketingEmails === "true";
    this.banterLevel = data.banterLevel || "medium";
    this.conflictBaseline = data.conflictBaseline || "calm";
    
    // Parse Dates properly - Auto-verify emails in local JSON DB for frictionless development
    this.emailVerified = data.emailVerified ? new Date(data.emailVerified) : new Date();
    this.verificationToken = data.emailVerified ? (data.verificationToken || null) : null;
    this.resetPasswordToken = data.resetPasswordToken || null;
    this.resetPasswordExpire = data.resetPasswordExpire ? new Date(data.resetPasswordExpire) : null;
    
    this.subscriptionTier = data.subscriptionTier || "free";
    this.subscriptionStatus = data.subscriptionStatus || "none";
    this.paymentProvider = data.paymentProvider || "none";
    this.billingRegion = data.billingRegion || "US";
    this.currency = data.currency || "USD";
    this.customerId = data.customerId || "";
    this.subscriptionId = data.subscriptionId || "";
    this.subscriptionExpiresAt = data.subscriptionExpiresAt ? new Date(data.subscriptionExpiresAt) : null;
    this.freeAnalysisUsed = data.freeAnalysisUsed === true || data.freeAnalysisUsed === "true";
    this.monthlyAnalysisCount = typeof data.monthlyAnalysisCount === "number" ? data.monthlyAnalysisCount : 0;
    this.lastUsageResetAt = data.lastUsageResetAt ? new Date(data.lastUsageResetAt) : new Date();

    // Refined Trial fields initialization
    this.trialStartedAt = data.trialStartedAt ? new Date(data.trialStartedAt) : null;
    this.trialExpiresAt = data.trialExpiresAt ? new Date(data.trialExpiresAt) : null;
    this.trialActivatedAt = data.trialActivatedAt ? new Date(data.trialActivatedAt) : null;
    this.hasUsedTrial = data.hasUsedTrial === true || data.hasUsedTrial === "true";
    this.currentPlan = data.currentPlan || "free";
    this.premiumAccessSource = data.premiumAccessSource || "none";
    this.signupIp = data.signupIp || "";
    this.lastKnownIp = data.lastKnownIp || "";
    this.signupDeviceFingerprint = data.signupDeviceFingerprint || "";
    this.trialAnalysesCount = typeof data.trialAnalysesCount === "number" ? data.trialAnalysesCount : 0;
    this.trialFeaturesEngaged = Array.isArray(data.trialFeaturesEngaged) ? data.trialFeaturesEngaged : [];

    // Relational arrays initialization
    this.chatAnalyses = Array.isArray(data.chatAnalyses) ? data.chatAnalyses : [];
    this.timelineMemories = Array.isArray(data.timelineMemories) ? data.timelineMemories : [];
    this.compatibilities = Array.isArray(data.compatibilities) ? data.compatibilities : [];
    this.emotionalReports = Array.isArray(data.emotionalReports) ? data.emotionalReports : [];

    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  // Mimics the Mongoose document.save() method
  async save() {
    const users = readLocalUsers();
    const index = users.findIndex((u) => u._id === this._id);
    this.updatedAt = new Date();

    if (index >= 0) {
      const existingUser = users[index];
      // Keep arrays from database to avoid overwriting updates from Model.create calls
      if (existingUser.chatAnalyses && existingUser.chatAnalyses.length > this.chatAnalyses.length) {
        this.chatAnalyses = existingUser.chatAnalyses;
      }
      if (existingUser.timelineMemories && existingUser.timelineMemories.length > this.timelineMemories.length) {
        this.timelineMemories = existingUser.timelineMemories;
      }
      if (existingUser.compatibilities && existingUser.compatibilities.length > this.compatibilities.length) {
        this.compatibilities = existingUser.compatibilities;
      }
      if (existingUser.emotionalReports && existingUser.emotionalReports.length > this.emotionalReports.length) {
        this.emotionalReports = existingUser.emotionalReports;
      }
    }

    const serialized = {
      ...this,
      chatAnalyses: this.chatAnalyses,
      timelineMemories: this.timelineMemories,
      compatibilities: this.compatibilities,
      emotionalReports: this.emotionalReports,
      emailVerified: this.emailVerified ? this.emailVerified.toISOString() : null,
      resetPasswordExpire: this.resetPasswordExpire ? this.resetPasswordExpire.toISOString() : null,
      subscriptionExpiresAt: this.subscriptionExpiresAt ? this.subscriptionExpiresAt.toISOString() : null,
      lastUsageResetAt: this.lastUsageResetAt ? this.lastUsageResetAt.toISOString() : null,
      trialStartedAt: this.trialStartedAt ? this.trialStartedAt.toISOString() : null,
      trialExpiresAt: this.trialExpiresAt ? this.trialExpiresAt.toISOString() : null,
      trialActivatedAt: this.trialActivatedAt ? this.trialActivatedAt.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };

    if (index >= 0) {
      const existingUser = users[index];
      users[index] = {
        ...existingUser,
        ...serialized,
      };
    } else {
      users.push(serialized);
    }

    writeLocalUsers(users);
    return this;
  }
}

// Mock User Model which mimics Mongoose's Model query functions
const MockUserModel = {
  async findOne(query: any) {
    const users = readLocalUsers();

    for (const u of users) {
      let isMatch = true;

      for (const key of Object.keys(query)) {
        const val = query[key];

        if (key === "email") {
          if (u.email?.toLowerCase() !== val?.toLowerCase()) {
            isMatch = false;
          }
        } else if (key === "verificationToken") {
          if (u.verificationToken !== val) {
            isMatch = false;
          }
        } else if (key === "resetPasswordToken") {
          if (u.resetPasswordToken !== val) {
            isMatch = false;
          }
        } else if (key === "resetPasswordExpire") {
          // Handles mongoose query structure: { $gt: new Date() }
          if (val && typeof val === "object" && "$gt" in val) {
            const expireTime = u.resetPasswordExpire ? new Date(u.resetPasswordExpire).getTime() : 0;
            const targetTime = new Date(val.$gt).getTime();
            if (expireTime <= targetTime) {
              isMatch = false;
            }
          } else if (new Date(u.resetPasswordExpire).getTime() !== new Date(val).getTime()) {
            isMatch = false;
          }
        } else if (key === "_id" || key === "id") {
          if (u._id?.toString() !== val?.toString()) {
            isMatch = false;
          }
        } else {
          if (u[key] !== val) {
            isMatch = false;
          }
        }
      }

      if (isMatch) {
        return new MockUserDocument(u);
      }
    }

    return null;
  },

  async create(data: any) {
    const doc = new MockUserDocument(data);
    await doc.save();
    return doc;
  },
};

// Dynamic ES6 Proxy to intercept mongoose methods at runtime if useMockDatabase is activated
const UserProxy = new Proxy(RealUser, {
  get(target, prop, receiver) {
    if (global.useMockDatabase) {
      if (prop === "findOne") {
        return MockUserModel.findOne;
      }
      if (prop === "create") {
        return MockUserModel.create;
      }
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default UserProxy as unknown as Model<IUser>;

