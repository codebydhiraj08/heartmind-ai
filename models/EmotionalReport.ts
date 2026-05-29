import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmotionalReport extends Document {
  userId: mongoose.Types.ObjectId;
  positivity: number;
  stress: number;
  connection: number;
  weekStartDate: Date;
  dailyTrends: any[];
  createdAt: Date;
  updatedAt: Date;
}

const EmotionalReportSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    positivity: {
      type: Number,
      required: [true, "Positivity level is required"],
      min: 0,
      max: 100,
    },
    stress: {
      type: Number,
      required: [true, "Stress level is required"],
      min: 0,
      max: 100,
    },
    connection: {
      type: Number,
      required: [true, "Connection index is required"],
      min: 0,
      max: 100,
    },
    weekStartDate: {
      type: Date,
      required: [true, "Week start date is required"],
    },
    dailyTrends: {
      type: [Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const RealEmotionalReport: Model<IEmotionalReport> =
  mongoose.models.EmotionalReport || mongoose.model<IEmotionalReport>("EmotionalReport", EmotionalReportSchema);

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

const MockEmotionalReportModel = {
  async find(query: any) {
    const users = readLocalUsers();
    const userId = query.userId?.toString();
    const user = users.find((u) => u._id === userId);
    if (!user) return [];
    return user.emotionalReports || [];
  },

  async findOne(query: any) {
    const users = readLocalUsers();
    for (const u of users) {
      const reports = u.emotionalReports || [];
      const match = reports.find((r: any) => {
        return Object.keys(query).every((key) => {
          const val = query[key];
          if (key === "_id" || key === "userId" || key.toLowerCase().endsWith("id")) {
            return r[key]?.toString() === val?.toString();
          }
          return r[key] === val;
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
      if (!user.emotionalReports) user.emotionalReports = [];

      const newReport = {
        _id: Math.random().toString(36).substring(2, 15),
        ...data,
        weekStartDate: data.weekStartDate ? new Date(data.weekStartDate).toISOString() : new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      user.emotionalReports.push(newReport);
      writeLocalUsers(users);
      return newReport;
    }
    throw new Error("User not found in mock database");
  },
};

const EmotionalReportProxy = new Proxy(RealEmotionalReport, {
  get(target, prop, receiver) {
    if (global.useMockDatabase) {
      if (prop === "find") {
        return MockEmotionalReportModel.find;
      }
      if (prop === "findOne") {
        return MockEmotionalReportModel.findOne;
      }
      if (prop === "create") {
        return MockEmotionalReportModel.create;
      }
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default EmotionalReportProxy as unknown as Model<IEmotionalReport>;
