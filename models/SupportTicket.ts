import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISupportTicket extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  message: string;
  status: string;
  ticketId: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema: Schema<ISupportTicket> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"], // e.g. "emotional", "billing", "bug", "feedback"
    },
    message: {
      type: String,
      required: [true, "Message details are required"],
    },
    status: {
      type: String,
      default: "open", // "open", "in-progress", "closed"
    },
    ticketId: {
      type: String,
      required: [true, "Ticket ID reference is required"],
    },
  },
  {
    timestamps: true,
  }
);

const RealSupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket || mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);

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

const MockSupportTicketModel = {
  async find(query: any) {
    const users = readLocalUsers();
    const userId = query.userId?.toString();
    if (!userId) {
      // Return all tickets for admin support
      const allTickets: any[] = [];
      users.forEach((u) => {
        if (u.supportTickets) {
          u.supportTickets.forEach((t: any) => {
            allTickets.push({ ...t, userEmail: u.email, userName: u.name });
          });
        }
      });
      return allTickets;
    }
    const user = users.find((u) => u._id === userId);
    if (!user) return [];
    return user.supportTickets || [];
  },

  async create(data: any) {
    const users = readLocalUsers();
    const userId = data.userId?.toString();
    const userIndex = users.findIndex((u) => u._id === userId);

    if (userIndex >= 0) {
      const user = users[userIndex];
      if (!user.supportTickets) user.supportTickets = [];

      const newTicket = {
        _id: Math.random().toString(36).substring(2, 15),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      user.supportTickets.push(newTicket);
      writeLocalUsers(users);
      return newTicket;
    }
    throw new Error("User not found in mock database");
  },
};

const SupportTicketProxy = new Proxy(RealSupportTicket, {
  get(target, prop, receiver) {
    if (global.useMockDatabase) {
      if (prop === "find") {
        return MockSupportTicketModel.find;
      }
      if (prop === "create") {
        return MockSupportTicketModel.create;
      }
    }
    return Reflect.get(target, prop, receiver);
  },
});

export default SupportTicketProxy as unknown as Model<ISupportTicket>;
