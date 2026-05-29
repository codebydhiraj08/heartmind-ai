import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompatibility extends Document {
  userId: mongoose.Types.ObjectId;
  partnerName: string;
  overallScore: number;
  communicationScore: number;
  attachmentScore: number;
  conflictScore: number;
  valuesScore: number;
  breakdown: any;
  createdAt: Date;
  updatedAt: Date;
}

const CompatibilitySchema: Schema<ICompatibility> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    partnerName: {
      type: String,
      required: [true, "Partner name is required"],
    },
    overallScore: {
      type: Number,
      required: [true, "Overall score is required"],
      min: 0,
      max: 100,
    },
    communicationScore: {
      type: Number,
      required: [true, "Communication score is required"],
      min: 0,
      max: 100,
    },
    attachmentScore: {
      type: Number,
      required: [true, "Attachment score is required"],
      min: 0,
      max: 100,
    },
    conflictScore: {
      type: Number,
      required: [true, "Conflict score is required"],
      min: 0,
      max: 100,
    },
    valuesScore: {
      type: Number,
      required: [true, "Values score is required"],
      min: 0,
      max: 100,
    },
    breakdown: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const RealCompatibility: Model<ICompatibility> =
  mongoose.models.Compatibility || mongoose.model<ICompatibility>("Compatibility", CompatibilitySchema);

// ==========================================
// 🛡️ LOCAL JSON FILE FALLBACK DATABASE SYSTEM
// ==========================================
import fs from "fs";
import path from "path";

const DB_FILE_PATH = path.join(process.cwd(), "db.json");

function readLocalUsers(): any[] {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(DB_FILE_PATH, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    return [];
  }
}

function writeLocalUsers(users: any[]) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(users, null, 2));
  } catch (err) {}
}

const MockCompatibilityModel = {
  async find(query: any) {
    const users = readLocalUsers();
    const userId = query.userId?.toString();
    const user = users.find((u) => u._id === userId);
    if (!user) return [];
    return user.compatibilities || [];
  },

  async findOne(query: any) {
    const users = readLocalUsers();
    for (const u of users) {
      const compatibilities = u.compatibilities || [];
      const match = compatibilities.find((c: any) => {
        return Object.keys(query).every((key) => {
          const val = query[key];
          if (key === "_id" || key === "userId" || key.toLowerCase().endsWith("id")) {
            return c[key]?.toString() === val?.toString();
          }
          return c[key] === val;
        });
      });
      if (match) return match;
    }
    return null;
  },

  async create(data: any) {
    const users = readLocalUsers();
    const userId = data.userId?.toString();
    const userIndex = users.findIndex((u) => u._id === userId);

    if (userIndex >= 0) {
      const user = users[userIndex];
      if (!user.compatibilities) user.compatibilities = [];

      const newCompatibility = {
        _id: Math.random().toString(36).substring(2, 15),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      user.compatibilities.push(newCompatibility);
      writeLocalUsers(users);
      return newCompatibility;
    }
    throw new Error("User not found in mock database");
  },
};

const CompatibilityProxy = new Proxy(RealCompatibility, {
  get(target, prop, receiver) {
    if (global.useMockDatabase) {
      if (prop === "find") {
        return MockCompatibilityModel.find;
      }
      if (prop === "findOne") {
        return MockCompatibilityModel.findOne;
      }
      if (prop === "create") {
        return MockCompatibilityModel.create;
      }
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default CompatibilityProxy as unknown as Model<ICompatibility>;
