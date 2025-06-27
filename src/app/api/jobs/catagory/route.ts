import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area");
  try {
    const jobs = await prisma.job.findMany({
      where: area ? { area } : {},
      include: {
        company: { select: { name: true } },
        qualifications: true,
        responsibilities: true,
        requiredSkills: true,
      },
    });

    const formattedJobs = jobs.map((job) => ({
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
    }));

    return NextResponse.json(formattedJobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
