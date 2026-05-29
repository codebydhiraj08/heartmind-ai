import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/welcome-email";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the user with this verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token. Please verify the link or register again." },
        { status: 400 }
      );
    }

    // Update verification states
    user.emailVerified = new Date();
    user.verificationToken = null; // Clear token after successful verification

    await user.save();

    // Trigger the beautiful welcome email dynamically!
    sendWelcomeEmail(user.name, user.email);

    return NextResponse.json(
      { message: "Your email has been successfully verified! You can now log in." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify Email Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
