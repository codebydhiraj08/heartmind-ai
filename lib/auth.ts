import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/welcome-email";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days session
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        await connectToDatabase();

        // Find user by email in MongoDB
        const user = await User.findOne({ email: credentials.email.toLowerCase() });

        if (!user) {
          throw new Error("No user found with this email");
        }

        // OAuth accounts don't have passwords stored
        if (!user.password) {
          throw new Error("Please log in with Google");
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Incorrect password");
        }

        // Check if email is verified (bypassed in local/development environments for smooth mobile/offline testing)
        const isLocalDev = 
          process.env.NODE_ENV !== "production" || 
          process.env.NEXTAUTH_URL?.includes("localhost") || 
          process.env.NEXTAUTH_URL?.includes("127.0.0.1") || 
          process.env.NEXTAUTH_URL?.includes("192.168");
          
        if (!user.emailVerified && !isLocalDev) {
          throw new Error("Please verify your email before logging in. Check your inbox for the link.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectToDatabase();

        // Search for user by email in database
        const existingUser = await User.findOne({ email: user.email?.toLowerCase() });

        if (!existingUser) {
          // Auto-register the Google OAuth user in MongoDB
          const newUser = await User.create({
            name: user.name || "Google User",
            email: user.email?.toLowerCase(),
            image: user.image || "",
            emailVerified: new Date(), // Google emails are pre-verified
          });

          // Trigger the welcome email for first-time Google user
          await sendWelcomeEmail(newUser.name, newUser.email);
        } else {
          // Sync Google image and emailVerified details to their existing manual account
          let modified = false;

          if (!existingUser.emailVerified) {
            existingUser.emailVerified = new Date();
            modified = true;
          }

          // Protect custom image (either raw base64 or proxy path) from Google's default avatar overwrite
          const hasCustomImage = existingUser.image && (
            existingUser.image.startsWith("data:image/") ||
            existingUser.image.includes("/api/user/profile-image")
          );

          if (user.image && !hasCustomImage && !existingUser.image) {
            existingUser.image = user.image;
            modified = true;
          }

          if (modified) {
            await existingUser.save();
          }
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        await connectToDatabase();
        // Force session ID to map to the database user's _id so Google and Credentials accounts match perfectly!
        const dbUser = await User.findOne({ email: user.email?.toLowerCase() });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.birthdate = dbUser.birthdate || "";
          token.age = dbUser.age || null;
          token.emailVerified = dbUser.emailVerified ? dbUser.emailVerified.toISOString() : null;
          
          token.coachTone = dbUser.coachTone || "empathetic";
          token.partnerName = dbUser.partnerName || "";
          token.relationshipStatus = dbUser.relationshipStatus || "dating";
          token.anniversaryDate = dbUser.anniversaryDate || "";
          token.tipsEnabled = dbUser.tipsEnabled !== false;
          token.analysisAlerts = dbUser.analysisAlerts !== false;
          token.marketingEmails = dbUser.marketingEmails === true;
          token.banterLevel = dbUser.banterLevel || "medium";
          token.conflictBaseline = dbUser.conflictBaseline || "calm";

          // Avoid storing heavy base64 strings in the JWT cookie
          const dbImage = dbUser.image || "";
          const safeImage = (dbImage.startsWith("data:image/") || dbImage.includes("/api/user/profile-image"))
            ? `/api/user/profile-image?v=${new Date().getTime()}`
            : dbImage;
          token.image = safeImage;
          token.picture = safeImage;
        } else {
          token.id = user.id;
          token.name = user.name;
          token.email = user.email;
          token.birthdate = (user as any).birthdate || "";
          token.age = (user as any).age || null;
          token.emailVerified = (user as any).emailVerified ? (user as any).emailVerified.toISOString() : null;

          token.coachTone = (user as any).coachTone || "empathetic";
          token.partnerName = (user as any).partnerName || "";
          token.relationshipStatus = (user as any).relationshipStatus || "dating";
          token.anniversaryDate = (user as any).anniversaryDate || "";
          token.tipsEnabled = (user as any).tipsEnabled !== false;
          token.analysisAlerts = (user as any).analysisAlerts !== false;
          token.marketingEmails = (user as any).marketingEmails === true;
          token.banterLevel = (user as any).banterLevel || "medium";
          token.conflictBaseline = (user as any).conflictBaseline || "calm";

          const userImage = user.image || "";
          const safeImage = (userImage.startsWith("data:image/") || userImage.includes("/api/user/profile-image"))
            ? `/api/user/profile-image?v=${new Date().getTime()}`
            : userImage;
          token.image = safeImage;
          token.picture = safeImage;
        }
      }

      if (trigger === "update" && session) {
        const updateData = session.user || session;
        if (updateData.name) token.name = updateData.name;
        if (updateData.email) token.email = updateData.email;

        // Fetch the absolute source of truth directly from the database!
        await connectToDatabase();
        const dbUser = await User.findOne({ email: token.email?.toLowerCase() });
        if (dbUser) {
          token.birthdate = dbUser.birthdate || "";
          token.age = dbUser.age || null;
          token.emailVerified = dbUser.emailVerified ? dbUser.emailVerified.toISOString() : null;
          
          token.coachTone = dbUser.coachTone || "empathetic";
          token.partnerName = dbUser.partnerName || "";
          token.relationshipStatus = dbUser.relationshipStatus || "dating";
          token.anniversaryDate = dbUser.anniversaryDate || "";
          token.tipsEnabled = dbUser.tipsEnabled !== false;
          token.analysisAlerts = dbUser.analysisAlerts !== false;
          token.marketingEmails = dbUser.marketingEmails === true;
          token.banterLevel = dbUser.banterLevel || "medium";
          token.conflictBaseline = dbUser.conflictBaseline || "calm";

          const dbImage = dbUser.image || "";
          const safeImage = (dbImage.startsWith("data:image/") || dbImage.includes("/api/user/profile-image"))
            ? `/api/user/profile-image?v=${new Date().getTime()}`
            : dbImage;
          token.image = safeImage;
          token.picture = safeImage;
        } else {
          if (updateData.birthdate !== undefined) token.birthdate = updateData.birthdate;
          if (updateData.age !== undefined) token.age = updateData.age;
          if (updateData.emailVerified !== undefined) token.emailVerified = updateData.emailVerified;
          
          if (updateData.coachTone !== undefined) token.coachTone = updateData.coachTone;
          if (updateData.partnerName !== undefined) token.partnerName = updateData.partnerName;
          if (updateData.relationshipStatus !== undefined) token.relationshipStatus = updateData.relationshipStatus;
          if (updateData.anniversaryDate !== undefined) token.anniversaryDate = updateData.anniversaryDate;
          if (updateData.tipsEnabled !== undefined) token.tipsEnabled = updateData.tipsEnabled;
          if (updateData.analysisAlerts !== undefined) token.analysisAlerts = updateData.analysisAlerts;
          if (updateData.marketingEmails !== undefined) token.marketingEmails = updateData.marketingEmails;
          if (updateData.banterLevel !== undefined) token.banterLevel = updateData.banterLevel;
          if (updateData.conflictBaseline !== undefined) token.conflictBaseline = updateData.conflictBaseline;

          const sessionImage = updateData.image || "";
          const safeImage = (sessionImage.startsWith("data:image/") || sessionImage.includes("/api/user/profile-image"))
            ? `/api/user/profile-image?v=${new Date().getTime()}`
            : sessionImage;
          token.image = safeImage;
          token.picture = safeImage;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = (token.image || token.picture) as string;
        (session.user as any).birthdate = token.birthdate as string;
        (session.user as any).age = token.age as number;
        (session.user as any).emailVerified = token.emailVerified as string | null;

        (session.user as any).coachTone = token.coachTone as string;
        (session.user as any).partnerName = token.partnerName as string;
        (session.user as any).relationshipStatus = token.relationshipStatus as string;
        (session.user as any).anniversaryDate = token.anniversaryDate as string;
        (session.user as any).tipsEnabled = token.tipsEnabled as boolean;
        (session.user as any).analysisAlerts = token.analysisAlerts as boolean;
        (session.user as any).marketingEmails = token.marketingEmails as boolean;
        (session.user as any).banterLevel = token.banterLevel as string;
        (session.user as any).conflictBaseline = token.conflictBaseline as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
