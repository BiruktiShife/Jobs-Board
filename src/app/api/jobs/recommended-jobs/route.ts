import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch the user's studyArea
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { studyArea: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch jobs filtered by user's studyArea
    const jobs = await prisma.job.findMany({
      where: {
        area: user.studyArea || undefined, // Filter by studyArea, or fetch all if undefined
      },
      include: {
        qualifications: true,
        responsibilities: true,
        requiredSkills: true,
        company: true,
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
