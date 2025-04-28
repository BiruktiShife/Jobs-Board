import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const jobId = url.searchParams.get("jobId");

    if (!userId || !jobId) {
      console.error("Check application: Missing userId or jobId");
      return NextResponse.json(
        { error: "Missing userId or jobId" },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    });

    return NextResponse.json({ hasApplied: !!application });
  } catch (error) {
    console.error("Error checking application:", error);
    return NextResponse.json(
      { error: "Failed to check application" },
      { status: 500 }
    );
  }
}
