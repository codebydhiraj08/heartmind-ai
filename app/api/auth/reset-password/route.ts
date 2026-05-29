import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find user with active token and check that it hasn't expired yet
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired recovery token. Please request a new link." },
        { status: 400 }
      );
    }

    // 1. Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Update user passwords and clear tokens
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    // Auto-verify email if not verified yet
    if (!user.emailVerified) {
      user.emailVerified = new Date();
    }

    await user.save();

    return NextResponse.json(
      { message: "Your password has been successfully updated! You can now log in." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
