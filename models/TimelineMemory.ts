import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITimelineMemory extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  date: Date;
  category: string;
  mood: string;
  location?: string;
  sentiment?: string;
  score?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TimelineMemorySchema: Schema<ITimelineMemory> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"], // e.g. "Milestone", "Conflict Resolved", "Memory", "Date Night"
    },
    mood: {
      type: String,
      required: [true, "Mood is required"], // e.g. "Excited", "Happy", "Reflective"
    },
    location: {
      type: String,
      default: "",
    },
    sentiment: {
      type: String,
      default: "positive",
    },
    score: {
      type: Number,
      default: 80,
    },
  },
  {
    timestamps: true,
  }
);

const RealTimelineMemory: Model<ITimelineMemory> =
  mongoose.models.TimelineMemory || mongoose.model<ITimelineMemory>("TimelineMemory", TimelineMemorySchema);

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

const MockTimelineMemoryModel = {
  async find(query: any) {
    const users = readLocalUsers();
    const userId = query.userId?.toString();
    const user = users.find((u) => u._id === userId);
    if (!user) return [];
    return user.timelineMemories || [];
  },

  async findOne(query: any) {
    const users = readLocalUsers();
    for (const u of users) {
      const memories = u.timelineMemories || [];
      const match = memories.find((m: any) => {
        return Object.keys(query).every((key) => {
          const val = query[key];
          if (key === "_id" || key === "userId" || key.toLowerCase().endsWith("id")) {
            return m[key]?.toString() === val?.toString();
          }
          return m[key] === val;
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
      if (!user.timelineMemories) user.timelineMemories = [];

      const newMemory = {
        _id: Math.random().toString(36).substring(2, 15),
        ...data,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      user.timelineMemories.push(newMemory);
      writeLocalUsers(users);
      return newMemory;
    }
    throw new Error("User not found in mock database");
  },

  async deleteOne(query: any) {
    const users = readLocalUsers();
    let deletedCount = 0;
    const updatedUsers = users.map((u) => {
      if (u.timelineMemories) {
        const initialLength = u.timelineMemories.length;
        u.timelineMemories = u.timelineMemories.filter((m: any) => {
          if (query._id && m._id !== query._id.toString()) return true;
          if (query.userId && m.userId?.toString() !== query.userId.toString()) return true;
          return false;
        });
        deletedCount += (initialLength - u.timelineMemories.length);
      }
      return u;
    });
    if (deletedCount > 0) {
      writeLocalUsers(updatedUsers);
    }
    return { deletedCount };
  },

  async findByIdAndDelete(id: string) {
    const users = readLocalUsers();
    let deletedMemory = null;
    const updatedUsers = users.map((u) => {
      if (u.timelineMemories) {
        const index = u.timelineMemories.findIndex((m: any) => m._id === id.toString());
        if (index !== -1) {
          deletedMemory = u.timelineMemories[index];
          u.timelineMemories.splice(index, 1);
        }
      }
      return u;
    });
    if (deletedMemory) {
      writeLocalUsers(updatedUsers);
    }
    return deletedMemory;
  },
};

const TimelineMemoryProxy = new Proxy(RealTimelineMemory, {
  get(target, prop, receiver) {
    if (global.useMockDatabase) {
      if (prop === "find") {
        return MockTimelineMemoryModel.find;
      }
      if (prop === "findOne") {
        return MockTimelineMemoryModel.findOne;
      }
      if (prop === "create") {
        return MockTimelineMemoryModel.create;
      }
      if (prop === "deleteOne") {
        return MockTimelineMemoryModel.deleteOne;
      }
      if (prop === "findByIdAndDelete") {
        return MockTimelineMemoryModel.findByIdAndDelete;
      }
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default TimelineMemoryProxy as unknown as Model<ITimelineMemory>;
