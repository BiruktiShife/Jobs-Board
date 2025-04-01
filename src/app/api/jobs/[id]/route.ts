// src/app/api/jobs/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobId = id;
    const job = (await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        qualifications: true,
        responsibilities: true,
        requiredSkills: true,
        company: true,
      },
    })) as Prisma.JobGetPayload<{
      include: {
        qualifications: true;
        responsibilities: true;
        requiredSkills: true;
        company: true;
      };
    }> | null;

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: job.id,
      title: job.title,
      area: job.area,
      company: job.company.name,
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
      qualifications: job.qualifications?.map((q) => q.value) || [],
      responsibilities: job.responsibilities?.map((r) => r.value) || [],
      requiredSkills: job.requiredSkills?.map((s) => s.value) || [],
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job details" },
      { status: 500 }
    );
  }
}
