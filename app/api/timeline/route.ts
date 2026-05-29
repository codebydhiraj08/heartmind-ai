import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import TimelineMemory from "@/models/TimelineMemory";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const memories = await TimelineMemory.find({ userId });

    return NextResponse.json({
      success: true,
      memories: memories || []
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { title, description, date, category, mood, location, sentiment, score } = body;

    if (!title || !description) {
      return NextResponse.json({ success: false, error: "Title and description are required" }, { status: 400 });
    }

    await connectToDatabase();

    const newMemory = await TimelineMemory.create({
      userId,
      title,
      description,
      date: date ? new Date(date) : new Date(),
      category: category || "Memory",
      mood: mood || "Happy",
      location: location || "",
      sentiment: sentiment || "positive",
      score: score !== undefined ? Number(score) : 80
    });

    return NextResponse.json({
      success: true,
      memory: newMemory
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const memoryId = searchParams.get("id");

    if (!memoryId) {
      return NextResponse.json({ success: false, error: "Memory ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Verify ownership and delete
    let result;
    if (global.useMockDatabase) {
      result = await TimelineMemory.deleteOne({ _id: memoryId, userId });
    } else {
      result = await TimelineMemory.deleteOne({ _id: memoryId, userId });
    }

    return NextResponse.json({
      success: true,
      message: "Memory deleted successfully",
      deletedCount: result ? result.deletedCount : 1
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
