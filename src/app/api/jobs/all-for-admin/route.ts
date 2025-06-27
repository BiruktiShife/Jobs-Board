import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Job, JobStatus } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    console.error("Jobs all-for-admin GET: Unauthorized, user:", session?.user);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jobs = await prisma.job.findMany({
      include: {
        company: { select: { id: true, name: true } },
        qualifications: true,
        responsibilities: true,
        requiredSkills: true,
        applications: { select: { id: true } },
      },
    });

    console.log("Jobs all-for-admin GET: Fetched", jobs.length, "jobs");

    return NextResponse.json<Job[]>(
      jobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company.name,
        companyId: job.company.id,
        logo: job.logo || "",
        area: job.area,
        location: job.location,
        deadline: job.deadline.toISOString().split("T")[0],
        site: job.site as "Full_time" | "Part_time" | "Freelance",
        about_job: job.about_job,
        qualifications: job.qualifications.map((q) => q.value) || [],
        responsibilities: job.responsibilities.map((r) => r.value) || [],
        requiredSkills: job.requiredSkills.map((s) => s.value) || [],
        postedDate: job.created_at.toISOString().split("T")[0],
        applications: job.applications.length,
        status: job.status as JobStatus,
      }))
    );
  } catch (error) {
    console.error("Jobs all-for-admin GET error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to fetch jobs due to a database issue. Please try again later.",
      },
      { status: 500 }
    );
  }
}
