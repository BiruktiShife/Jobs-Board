import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch the user's studyArea (now an array)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { studyArea: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch jobs where the job's area is in the user's studyArea array
    const jobs = await prisma.job.findMany({
      where: {
        AND: [
          {
            area:
              user.studyArea && user.studyArea.length > 0
                ? { in: user.studyArea }
                : undefined, // Use 'in' for array matching
          },
          {
            status: "APPROVED", // Only show approved jobs in recommendations
          },
        ],
      },
      select: {
        id: true,
        title: true,
        area: true,
        logo: true,
        about_job: true,
        location: true,
        deadline: true,
        site: true,
        created_at: true,
        company: {
          select: {
            name: true,
          },
        },
        qualifications: {
          select: {
            value: true,
          },
        },
        responsibilities: {
          select: {
            value: true,
          },
        },
        requiredSkills: {
          select: {
            value: true,
          },
        },
      },
    });

    return NextResponse.json(
      jobs.map((job) => ({
        id: job.id,
        title: job.title,
        area: job.area,
        company_name: job.company.name,
        logo: job.logo,
        about_job: job.about_job,
        location: job.location,
        deadline: job.deadline.toISOString().split("T")[0],
        site:
          job.site === "Full_time"
            ? "Full-time"
            : job.site === "Part_time"
              ? "Part-time"
              : job.site,
        qualifications: job.qualifications.map((q) => q.value),
        responsibilities: job.responsibilities.map((r) => r.value),
        requiredSkills: job.requiredSkills.map((s) => s.value),
        postedDate: job.created_at
          ? job.created_at.toISOString()
          : job.deadline.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
