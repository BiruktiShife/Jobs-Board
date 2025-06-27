import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Job, JobStatus } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
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
      console.error("Jobs GET: Job not found, ID:", id);
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Restrict non-admins to APPROVED jobs
    if (session?.user?.role !== "ADMIN" && job.status !== "APPROVED") {
      console.error(
        "Jobs GET: Unauthorized access to non-approved job, ID:",
        id
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    console.log("Jobs GET: Fetched job ID:", id);
    return NextResponse.json<Job>({
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
    console.error("Jobs DELETE: Unauthorized, user:", session?.user);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    console.log(`Attempting to delete job with ID: ${id}`);

    // Delete related records in a transaction
    await prisma.$transaction([
      prisma.qualification.deleteMany({ where: { jobId: id } }),
      prisma.responsibility.deleteMany({ where: { jobId: id } }),
      prisma.skill.deleteMany({ where: { jobId: id } }), // Fixed 'skill' to 'requiredSkill'
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
    console.error("Jobs PUT: Unauthorized, user:", session?.user);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const jobData: Partial<Job> = await request.json();

    // Validate required fields
    if (
      !jobData.title ||
      !jobData.companyId ||
      !jobData.area ||
      !jobData.location ||
      !jobData.deadline ||
      !jobData.site ||
      !jobData.about_job ||
      !Array.isArray(jobData.qualifications) ||
      !Array.isArray(jobData.responsibilities) ||
      !Array.isArray(jobData.requiredSkills) ||
      !jobData.status
    ) {
      console.error("Jobs PUT: Missing or invalid required fields, ID:", id);
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Validate site
    if (!["Full_time", "Part_time", "Freelance"].includes(jobData.site)) {
      console.error("Jobs PUT: Invalid employment type, ID:", id);
      return NextResponse.json(
        { error: "Invalid employment type" },
        { status: 400 }
      );
    }

    // Validate status
    if (!["PENDING", "APPROVED", "REJECTED"].includes(jobData.status)) {
      console.error("Jobs PUT: Invalid status, ID:", id);
      return NextResponse.json(
        { error: "Invalid job status" },
        { status: 400 }
      );
    }

    // Validate arrays
    if (
      jobData.qualifications.some((q: string) => !q.trim()) ||
      jobData.responsibilities.some((r: string) => !r.trim()) ||
      jobData.requiredSkills.some((s: string) => !s.trim())
    ) {
      console.error(
        "Jobs PUT: Array fields cannot contain empty strings, ID:",
        id
      );
      return NextResponse.json(
        { error: "Array fields cannot contain empty strings" },
        { status: 400 }
      );
    }

    // Validate deadline format
    const deadlineDate = new Date(jobData.deadline);
    if (isNaN(deadlineDate.getTime())) {
      console.error("Jobs PUT: Invalid deadline format, ID:", id);
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
      console.error("Jobs PUT: Company not found, ID:", jobData.companyId);
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title: jobData.title,
        companyId: jobData.companyId,
        logo: jobData.logo || "",
        area: jobData.area,
        location: jobData.location,
        deadline: deadlineDate,
        site: jobData.site,
        about_job: jobData.about_job,
        status: jobData.status,
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

    console.log("Jobs PUT: Updated job ID:", id);
    return NextResponse.json<Job>({
      id: updatedJob.id,
      title: updatedJob.title,
      company: updatedJob.company.name,
      companyId: updatedJob.company.id,
      logo: updatedJob.logo,
      area: updatedJob.area,
      location: updatedJob.location,
      deadline: updatedJob.deadline.toISOString().split("T")[0],
      site: updatedJob.site as "Full_time" | "Part_time" | "Freelance",
      about_job: updatedJob.about_job,
      qualifications: updatedJob.qualifications.map((q) => q.value) || [],
      responsibilities: updatedJob.responsibilities.map((r) => r.value) || [],
      requiredSkills: updatedJob.requiredSkills.map((s) => s.value) || [],
      postedDate: updatedJob.created_at.toISOString().split("T")[0],
      applications: updatedJob.applications.length,
      status: updatedJob.status as JobStatus,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}
