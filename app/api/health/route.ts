import { NextResponse } from "next/server";

/**
 * Health Check Endpoint
 * Used for monitoring and uptime checks
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
    },
    { status: 200 }
  );
}
