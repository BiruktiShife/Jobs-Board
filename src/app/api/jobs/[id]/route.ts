import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Job } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        qualifications: true,
        responsibilities: true,
        requiredSkills: true,
        company: { select: { id: true, name: true } },
        applications: { select: { id: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json<Job>({
      id: job.id,
      title: job.title,
      company: job.company.name,
      companyId: job.company.id,
      logo: job.logo,
      area: job.area,
      location: job.location,
      deadline: job.deadline.toISOString().split("T")[0],
      site: job.site,
      about_job: job.about_job,
      qualifications: job.qualifications.map((q) => q.value) || [],
      responsibilities: job.responsibilities.map((r) => r.value) || [],
      requiredSkills: job.requiredSkills.map((s) => s.value) || [],
      postedDate: job.created_at.toISOString().split("T")[0],
      applications: job.applications.length,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job details" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    console.log(`Attempting to delete job with ID: ${id}`);

    // Delete related records in a transaction
    await prisma.$transaction([
      prisma.qualification.deleteMany({ where: { jobId: id } }),
      prisma.responsibility.deleteMany({ where: { jobId: id } }),
      prisma.skill.deleteMany({ where: { jobId: id } }),
      prisma.application.deleteMany({ where: { jobId: id } }),
      prisma.bookmark.deleteMany({ where: { jobId: id } }),
      prisma.job.delete({ where: { id } }),
    ]);

    console.log(`Successfully deleted job with ID: ${id}`);
    return NextResponse.json(
      { message: "Job deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const jobData: Partial<Job> = await request.json();

    // Validate required fields
    if (
      !jobData.title ||
      !jobData.companyId ||
      !jobData.logo ||
      !jobData.area ||
      !jobData.location ||
      !jobData.deadline ||
      !jobData.site ||
      !jobData.about_job ||
      !Array.isArray(jobData.qualifications) ||
      !Array.isArray(jobData.responsibilities) ||
      !Array.isArray(jobData.requiredSkills)
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Validate site
    if (!["Full_time", "Part_time", "Freelance"].includes(jobData.site)) {
      return NextResponse.json(
        { error: "Invalid employment type" },
        { status: 400 }
      );
    }

    // Validate arrays
    if (
      jobData.qualifications.some((q: string) => !q.trim()) ||
      jobData.responsibilities.some((r: string) => !r.trim()) ||
      jobData.requiredSkills.some((s: string) => !s.trim())
    ) {
      return NextResponse.json(
        { error: "Array fields cannot contain empty strings" },
        { status: 400 }
      );
    }

    // Validate deadline format
    const deadlineDate = new Date(jobData.deadline);
    if (isNaN(deadlineDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid deadline format" },
        { status: 400 }
      );
    }

    // Validate companyId exists
    const company = await prisma.company.findUnique({
      where: { id: jobData.companyId },
      select: { id: true, name: true },
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title: jobData.title,
        companyId: jobData.companyId,
        logo: jobData.logo,
        area: jobData.area,
        location: jobData.location,
        deadline: deadlineDate,
        site: jobData.site,
        about_job: jobData.about_job,
        qualifications: {
          deleteMany: {},
          create: jobData.qualifications.map((value: string) => ({ value })),
        },
        responsibilities: {
          deleteMany: {},
          create: jobData.responsibilities.map((value: string) => ({ value })),
        },
        requiredSkills: {
          deleteMany: {},
          create: jobData.requiredSkills.map((value: string) => ({ value })),
        },
      },
      include: {
        qualifications: true,
        responsibilities: true,
        requiredSkills: true,
        company: { select: { id: true, name: true } },
        applications: { select: { id: true } },
      },
    });

    return NextResponse.json<Job>({
      id: updatedJob.id,
      title: updatedJob.title,
      company: updatedJob.company.name,
      companyId: updatedJob.company.id,
      logo: updatedJob.logo,
      area: updatedJob.area,
      location: updatedJob.location,
      deadline: updatedJob.deadline.toISOString().split("T")[0],
      site: updatedJob.site,
      about_job: updatedJob.about_job,
      qualifications: updatedJob.qualifications.map((q) => q.value) || [],
      responsibilities: updatedJob.responsibilities.map((r) => r.value) || [],
      requiredSkills: updatedJob.requiredSkills.map((s) => s.value) || [],
      postedDate: updatedJob.created_at.toISOString().split("T")[0],
      applications: updatedJob.applications.length,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}
