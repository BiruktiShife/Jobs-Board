// src/app/api/company-jobs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY_ADMIN") {
    console.log("Unauthorized access attempt:", session?.user);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if company exists and is approved
    const company = await prisma.company.findUnique({
      where: { adminEmail: session.user.email! },
      select: { id: true, name: true, status: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: `No company found for admin email: ${session.user.email}` },
        { status: 404 }
      );
    }

    if (company.status !== "APPROVED") {
      console.log("Company not approved:", session.user.email, company.status);
      return NextResponse.json(
        {
          error: "Company not approved",
          status: company.status,
        },
        { status: 403 }
      );
    }

    const jobs = await prisma.job.findMany({
      where: {
        companyId: company.id,
      },
      include: {
        applications: true,
      },
    });

    return NextResponse.json({
      companyName: company.name,
      jobs: jobs.map((job) => ({
        id: job.id,
        title: job.title,
        area: job.area,
        location: job.location,
        deadline: job.deadline,
        status: job.status || "PENDING",
        applications: job.applications,
      })),
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
