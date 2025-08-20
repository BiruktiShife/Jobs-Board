import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Basic health check
    return NextResponse.json(
      { 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        service: "job-board-api"
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        status: "unhealthy", 
        timestamp: new Date().toISOString(),
        error: "Service unavailable"
      },
      { status: 503 }
    );
  }
}
