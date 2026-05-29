import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  platform: string;
  sentiment: string;
  score: number;
  dateText: string;
  analysisResult: any;
  schemaVersion?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChatAnalysisSchema: Schema<IChatAnalysis> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    name: {
      type: String,
      required: [true, "Analysis name is required"],
    },
    platform: {
      type: String,
      required: [true, "Platform name is required"],
    },
    sentiment: {
      type: String,
      required: [true, "Sentiment is required"],
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: 0,
      max: 100,
    },
    dateText: {
      type: String,
      required: [true, "Date display text is required"],
    },
    analysisResult: {
      type: Schema.Types.Mixed,
      default: {},
    },
    schemaVersion: {
      type: Number,
      default: 2,
    },
  },
  {
    timestamps: true,
  }
);

const RealChatAnalysis: Model<IChatAnalysis> =
  mongoose.models.ChatAnalysis || mongoose.model<IChatAnalysis>("ChatAnalysis", ChatAnalysisSchema);

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

class MockQuery<T> {
  private _promise: Promise<T[]>;

  constructor(promise: Promise<T[]>) {
    this._promise = promise;
  }

  sort(sortOption: any) {
    this._promise = this._promise.then((results) => {
      if (!Array.isArray(results)) return results;
      const sorted = [...results];
      const keys = Object.keys(sortOption);
      if (keys.length > 0) {
        const key = keys[0];
        const direction = sortOption[key]; // 1 or -1
        sorted.sort((a: any, b: any) => {
          const valA = a[key];
          const valB = b[key];
          if (valA === undefined || valB === undefined) return 0;
          
          const comparisonA = (typeof valA === "string" && !isNaN(Date.parse(valA))) ? new Date(valA).getTime() : valA;
          const comparisonB = (typeof valB === "string" && !isNaN(Date.parse(valB))) ? new Date(valB).getTime() : valB;
          
          if (comparisonA < comparisonB) return direction === -1 ? 1 : -1;
          if (comparisonA > comparisonB) return direction === -1 ? -1 : 1;
          return 0;
        });
      }
      return sorted;
    });
    return this;
  }

  limit(count: number) {
    this._promise = this._promise.then((results) => {
      if (!Array.isArray(results)) return results;
      return results.slice(0, count);
    });
    return this;
  }

  then<TResult1 = T[], TResult2 = never>(
    onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this._promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<T[] | TResult> {
    return this._promise.catch(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<T[]> {
    return this._promise.finally(onfinally);
  }
}

class MockQueryOne<T> {
  private _promise: Promise<T | null>;
  private _query: any;

  constructor(promise: Promise<T | null>, query: any) {
    this._promise = promise;
    this._query = query;
  }

  sort(sortOption: any) {
    const executeWithSort = async () => {
      const users = readLocalUsers();
      let matches: any[] = [];
      for (const u of users) {
        const analyses = u.chatAnalyses || [];
        const userMatches = analyses.filter((a: any) => {
          return Object.keys(this._query).every((key) => {
            const val = this._query[key];
            if (key === "_id" || key === "userId" || key.toLowerCase().endsWith("id")) {
              return a[key]?.toString() === val?.toString();
            }
            return a[key] === val;
          });
        });
        matches = [...matches, ...userMatches];
      }
      
      if (matches.length === 0) return null;

      const keys = Object.keys(sortOption);
      if (keys.length > 0) {
        const key = keys[0];
        const direction = sortOption[key]; // 1 or -1
        matches.sort((a: any, b: any) => {
          const valA = a[key];
          const valB = b[key];
          if (valA === undefined || valB === undefined) return 0;
          
          const comparisonA = (typeof valA === "string" && !isNaN(Date.parse(valA))) ? new Date(valA).getTime() : valA;
          const comparisonB = (typeof valB === "string" && !isNaN(Date.parse(valB))) ? new Date(valB).getTime() : valB;
          
          if (comparisonA < comparisonB) return direction === -1 ? 1 : -1;
          if (comparisonA > comparisonB) return direction === -1 ? -1 : 1;
          return 0;
        });
      }
      return matches[0];
    };

    this._promise = executeWithSort();
    return this;
  }

  then<TResult1 = T | null, TResult2 = never>(
    onfulfilled?: ((value: T | null) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this._promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<T | null | TResult> {
    return this._promise.catch(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<T | null> {
    return this._promise.finally(onfinally);
  }
}

const MockChatAnalysisModel = {
  find(query: any) {
    const execute = async () => {
      const users = readLocalUsers();
      const userId = query.userId?.toString();
      const user = users.find((u) => u._id === userId);
      if (!user) return [];
      return user.chatAnalyses || [];
    };
    return new MockQuery(execute());
  },

  findOne(query: any) {
    const execute = async () => {
      const users = readLocalUsers();
      for (const u of users) {
        const analyses = u.chatAnalyses || [];
        const match = analyses.find((a: any) => {
          return Object.keys(query).every((key) => {
            const val = query[key];
            if (key === "_id" || key === "userId" || key.toLowerCase().endsWith("id")) {
              return a[key]?.toString() === val?.toString();
            }
            return a[key] === val;
          });
        });
        if (match) return match;
      }
      return null;
    };
    return new MockQueryOne(execute(), query);
  },

  async create(data: any) {
    const users = readLocalUsers();
    const userId = data.userId?.toString();
    const userIndex = users.findIndex((u) => u._id === userId);

    if (userIndex >= 0) {
      const user = users[userIndex];
      if (!user.chatAnalyses) user.chatAnalyses = [];

      const newAnalysis = {
        _id: Math.random().toString(36).substring(2, 15),
        schemaVersion: 2,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      user.chatAnalyses.push(newAnalysis);
      writeLocalUsers(users);
      return newAnalysis;
    }
    throw new Error("User not found in mock database");
  },
};

const ChatAnalysisProxy = new Proxy(RealChatAnalysis, {
  get(target, prop, receiver) {
    if (prop === "find" && global.useMockDatabase) {
      return MockChatAnalysisModel.find;
    }
    if (prop === "findOne" && global.useMockDatabase) {
      return MockChatAnalysisModel.findOne;
    }
    if (prop === "create" && global.useMockDatabase) {
      return MockChatAnalysisModel.create;
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default ChatAnalysisProxy as unknown as Model<IChatAnalysis>;
