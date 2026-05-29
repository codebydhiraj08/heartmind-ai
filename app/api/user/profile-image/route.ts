import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;
    if (!userId) {
      return new NextResponse("Unauthorized: Session missing user ID", { status: 401 });
    }

    const user = await User.findOne({ _id: userId });
    if (!user || !user.image) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const imageUrl = user.image as string;

    // Handle Base64 encoded images (e.g. data:image/png;base64,iVBORw...)
    if (imageUrl.startsWith("data:image/")) {
      const parts = imageUrl.split(",");
      const meta = parts[0];
      const base64Data = parts[1];
      
      const mimeMatch = meta.match(/data:([^;]+)/);
      const contentType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      
      if (base64Data) {
        const buffer = Buffer.from(base64Data, "base64");
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
          },
        });
      }
    }

    // Handle external links (e.g., Google OAuth profile pictures)
    if (imageUrl.startsWith("http")) {
      return NextResponse.redirect(imageUrl);
    }

    // Default Fallback
    return new NextResponse("Not Found", { status: 404 });
  } catch (error: any) {
    console.error("Profile image stream proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
