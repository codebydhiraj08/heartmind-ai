import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  // Detect if the Google client ID is missing or set to the default placeholder
  const isPlaceholder = 
    !clientId || 
    clientId.includes("your_google_client_id") || 
    clientId === "";

  return NextResponse.json({ isPlaceholder });
}
