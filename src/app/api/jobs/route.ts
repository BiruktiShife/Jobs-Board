import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  try {
    const jobs = await prisma.job.findMany({
      where: {
        // Only return approved jobs unless the user is an admin
        status: session?.user.role === "ADMIN" ? undefined : "APPROVED",
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
        status: job.status,
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const jobData = body;

    const companyExists = await prisma.company.findUnique({
      where: { id: jobData.companyId },
    });
    if (!companyExists) {
      return NextResponse.json(
        { error: "Invalid companyId: Company does not exist" },
        { status: 400 }
      );
    }

    const createdJob = await prisma.job.create({
      data: {
        title: jobData.title,
        companyId: jobData.companyId,
        logo: jobData.logo,
        area: jobData.area,
        location: jobData.location,
        deadline: new Date(jobData.deadline),
        site: jobData.site,
        about_job: jobData.about_job,
        status: "PENDING",
        qualifications: {
          create: jobData.qualifications.map((value: string) => ({ value })),
        },
        responsibilities: {
          create: jobData.responsibilities.map((value: string) => ({ value })),
        },
        requiredSkills: {
          create: jobData.requiredSkills.map((value: string) => ({ value })),
        },
      },
      include: {
        qualifications: true,
        responsibilities: true,
        requiredSkills: true,
        company: true,
      },
    });

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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}

// export async function GET() {
//   const session = await getServerSession(authOptions);
//   if (!session || !session.user.email) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     // Fetch the user's studyArea
//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email },
//       select: { studyArea: true },
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // Fetch jobs filtered by user's studyArea
//     const jobs = await prisma.job.findMany({
//       where: {
//         area: user.studyArea || undefined, // Filter by studyArea, or fetch all if undefined
//       },
//       include: {
//         qualifications: true,
//         responsibilities: true,
//         requiredSkills: true,
//         company: true,
//       },
//     });

//     return NextResponse.json(
//       jobs.map((job) => ({
//         id: job.id,
//         title: job.title,
//         area: job.area,
//         company_name: job.company.name,
//         logo: job.logo,
//         about_job: job.about_job,
//         location: job.location,
//         deadline: job.deadline.toISOString().split("T")[0],
//         site:
//           job.site === "Full_time"
//             ? "Full-time"
//             : job.site === "Part_time"
//             ? "Part-time"
//             : job.site,
//         qualifications: job.qualifications.map((q) => q.value),
//         responsibilities: job.responsibilities.map((r) => r.value),
//         requiredSkills: job.requiredSkills.map((s) => s.value),
//       }))
//     );
//   } catch (error) {
//     console.error("Failed to fetch jobs:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch jobs" },
//       { status: 500 }
//     );
//   }
// }
