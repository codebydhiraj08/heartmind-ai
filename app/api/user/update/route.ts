import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const {
      name,
      email,
      password,
      image,
      birthdate,
      age,
      coachTone,
      partnerName,
      relationshipStatus,
      anniversaryDate,
      tipsEnabled,
      analysisAlerts,
      marketingEmails,
      banterLevel,
      conflictBaseline,
    } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ success: false, error: "Name and email are required" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ _id: userId }) as any;

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // If email is changing, make sure it's not already in use
    if (email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return NextResponse.json({ success: false, error: "This email is already registered to another account" }, { status: 400 });
      }
      user.email = email.toLowerCase();
    }

    user.name = name;
    if (image !== undefined && !image.includes("/api/user/profile-image")) {
      user.image = image;
    }

    if (birthdate !== undefined) {
      user.birthdate = birthdate;
    }
    
    if (age !== undefined) {
      user.age = typeof age === "number" ? age : (age ? parseInt(age) : null);
    }

    if (coachTone !== undefined) {
      user.coachTone = coachTone;
    }

    if (partnerName !== undefined) {
      user.partnerName = partnerName;
    }

    if (relationshipStatus !== undefined) {
      user.relationshipStatus = relationshipStatus;
    }

    if (anniversaryDate !== undefined) {
      user.anniversaryDate = anniversaryDate;
    }

    if (tipsEnabled !== undefined) {
      user.tipsEnabled = tipsEnabled === true || tipsEnabled === "true";
    }

    if (analysisAlerts !== undefined) {
      user.analysisAlerts = analysisAlerts === true || analysisAlerts === "true";
    }

    if (marketingEmails !== undefined) {
      user.marketingEmails = marketingEmails === true || marketingEmails === "true";
    }

    if (banterLevel !== undefined) {
      user.banterLevel = banterLevel;
    }

    if (conflictBaseline !== undefined) {
      user.conflictBaseline = conflictBaseline;
    }

    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return NextResponse.json({ success: false, error: "Password must be at least 6 characters long" }, { status: 400 });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
        birthdate: user.birthdate,
        age: user.age,
        coachTone: user.coachTone,
        partnerName: user.partnerName,
        relationshipStatus: user.relationshipStatus,
        anniversaryDate: user.anniversaryDate,
        tipsEnabled: user.tipsEnabled,
        analysisAlerts: user.analysisAlerts,
        marketingEmails: user.marketingEmails,
        banterLevel: user.banterLevel,
        conflictBaseline: user.conflictBaseline,
      }
    });
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update profile settings" }, { status: 500 });
  }
}
