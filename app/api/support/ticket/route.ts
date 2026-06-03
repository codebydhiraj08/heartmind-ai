import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { category, message, ticketId } = body;

    if (!category || !message || !ticketId) {
      return NextResponse.json({ success: false, error: "Category, message and ticketId are required" }, { status: 400 });
    }

    await connectToDatabase();

    const newTicket = await SupportTicket.create({
      userId,
      category,
      message,
      ticketId,
      status: "open",
    });

    return NextResponse.json({
      success: true,
      ticket: newTicket
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const viewAll = searchParams.get("viewAll") === "true";

    await connectToDatabase();

    let tickets;
    if (viewAll) {
      // In MongoDB, SupportTicket.find({}) will fetch all tickets.
      // In mock DB system, find({ userId: null }) triggers returning all tickets as we coded in the proxy!
      tickets = await SupportTicket.find(global.useMockDatabase ? { userId: null } : {});
    } else {
      tickets = await SupportTicket.find({ userId });
    }

    return NextResponse.json({
      success: true,
      tickets: tickets || []
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
