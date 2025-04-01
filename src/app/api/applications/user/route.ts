import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "JOB_SEEKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const applications = await prisma.application.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        job: {
          include: {
            company: true, // Include Company for name
          },
        },
      },
    });

    const appliedJobs = applications.map((app) => ({
      id: app.id,
      title: app.job.title,
      status: app.status || "Pending", // Safe now that status exists
      company: app.job.company.name,
    }));

    return NextResponse.json(appliedJobs, { status: 200 });
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch applied jobs" },
      { status: 500 }
    );
  }
}
