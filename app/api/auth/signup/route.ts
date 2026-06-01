import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/verification-email";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 1. Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please fill in all fields" },
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

    // 2. Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // 5. Create new User
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      verificationToken,
      emailVerified: null, // Marked unverified initially
    });

    // 6. Send the real verification email
    const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;
    
    // MUST AWAIT in serverless environments (Vercel) to prevent container shutdown during SMTP handshake!
    await sendVerificationEmail(name, email, verifyUrl);

    return NextResponse.json(
      {
        message: "Account created successfully! Check terminal logs to verify your email.",
        userId: newUser._id.toString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
