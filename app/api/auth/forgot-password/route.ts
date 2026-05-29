import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Please enter your email address" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // 1. Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // 2. Set token and expiration (1 hour from now)
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpire = new Date(Date.now() + 3600000); // 1 hour

      await user.save();

      // 3. Print reset URL in dev logs
      const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
      
      console.log("\n=======================================================");
      console.log("🔑 DEVELOPMENT PASSWORD RESET REQUEST 🔑");
      console.log(`User: ${user.name} (${email})`);
      console.log(`Link: ${resetUrl}`);
      console.log("=======================================================\n");
    }

    // Always return a generic success message to prevent user enumeration / security leaks
    return NextResponse.json(
      { message: "If this email is registered in our system, a recovery link has been generated. Check terminal logs." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
