import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jobs = await prisma.job.findMany({
      include: {
        applications: {
          select: { id: true },
        },
        company: { select: { name: true } },
      },
    });

    const jobData = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company.name,
      postedDate: job.created_at.toISOString().split("T")[0],
      applications: job.applications.length,
      deadline: job.deadline.toISOString(),
      status: job.status || "PENDING",
    }));

    return NextResponse.json(jobData, { status: 200 });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
