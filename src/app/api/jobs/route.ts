import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { Job, JobStatus } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);

  try {
    const jobs = await prisma.job.findMany({
      where: {
        ...(session?.user?.role !== "ADMIN" ? { status: "APPROVED" } : {}),
      },
      include: {
        company: { select: { id: true, name: true } },
        qualifications: true,
        responsibilities: true,
        requiredSkills: true,
        applications: { select: { id: true } },
      },
    });

    console.log("Jobs GET: Fetched", jobs.length, "jobs");

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
    console.error("Jobs GET error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to fetch jobs due to a database issue. Please try again later.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "COMPANY_ADMIN") {
      console.error("Jobs POST: Unauthorized, user:", session?.user);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobData = await request.json();

    // Validate required fields
    if (
      !jobData.title ||
      !jobData.area ||
      !jobData.location ||
      !jobData.deadline ||
      !jobData.about_job
    ) {
      console.error("Jobs POST: Missing required fields", jobData);
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the company for the authenticated user
    const company = await prisma.company.findFirst({
      where: { adminId: session.user.id },
    });

    if (!company) {
      console.error(
        "Jobs POST: No company found for adminId:",
        session.user.id
      );
      return NextResponse.json(
        { error: "No company registered for this user" },
        { status: 400 }
      );
    }

    if (company.status !== "APPROVED") {
      console.error("Jobs POST: Company not approved, status:", company.status);
      return NextResponse.json(
        { error: "Cannot post jobs until company is approved by an admin" },
        { status: 403 }
      );
    }

    const createdJob = await prisma.job.create({
      data: {
        title: jobData.title,
        companyId: company.id,
        logo: jobData.logo || company.logo || "",
        area: jobData.area,
        location: jobData.location,
        deadline: new Date(jobData.deadline),
        site: jobData.site || "Full_time",
        about_job: jobData.about_job,
        status: "PENDING",
        qualifications: {
          create: (jobData.qualifications || []).map((value: string) => ({
            value,
          })),
        },
        responsibilities: {
          create: (jobData.responsibilities || []).map((value: string) => ({
            value,
          })),
        },
        requiredSkills: {
          create: (jobData.requiredSkills || []).map((value: string) => ({
            value,
          })),
        },
      },
      include: {
        qualifications: true,
        responsibilities: true,
        requiredSkills: true,
        company: true,
      },
    });

    console.log(
      "Jobs POST: Created job ID:",
      createdJob.id,
      "companyId:",
      company.id
    );
    return NextResponse.json(
      {
        id: createdJob.id,
        title: createdJob.title,
        area: createdJob.area,
        company_name: createdJob.company.name,
        logo: createdJob.logo,
        about_job: createdJob.about_job,
        location: createdJob.location,
        deadline: createdJob.deadline.toISOString().split("T")[0],
        site:
          createdJob.site === "Full_time"
            ? "Full-time"
            : createdJob.site === "Part_time"
              ? "Part-time"
              : createdJob.site,
        qualifications: createdJob.qualifications.map((q) => q.value),
        responsibilities: createdJob.responsibilities.map((r) => r.value),
        requiredSkills: createdJob.requiredSkills.map((s) => s.value),
        status: createdJob.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Jobs POST error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create job",
      },
      { status: 500 }
    );
  }
}
