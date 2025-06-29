import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-server";
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
            company: true,
          },
        },
      },
    });

    const appliedJobs = applications.map((app) => ({
      id: app.id,
      title: app.job.title,
      status: app.status || "Pending",
      Company: app.job.company.name,
      appliedOn: app.job.created_at.toISOString().split("T")[0],
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
