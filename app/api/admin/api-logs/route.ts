import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const LOG_FILE = path.join(process.cwd(), "api-logs.json");
const ADMIN_EMAILS = ["official.heartmindai@gmail.com", "dhirajwarangane@gmail.com"];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !ADMIN_EMAILS.includes(session.user.email || "")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access only." },
        { status: 403 }
      );
    }

    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
      const data = fs.readFileSync(LOG_FILE, "utf8");
      logs = JSON.parse(data || "[]");
    }

    return NextResponse.json({
      success: true,
      logs
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load API logs." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !ADMIN_EMAILS.includes(session.user.email || "")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access only." },
        { status: 403 }
      );
    }

    if (fs.existsSync(LOG_FILE)) {
      fs.writeFileSync(LOG_FILE, JSON.stringify([], null, 2));
    }

    return NextResponse.json({
      success: true,
      message: "API logs cleared successfully."
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to clear API logs." },
      { status: 500 }
    );
  }
}
