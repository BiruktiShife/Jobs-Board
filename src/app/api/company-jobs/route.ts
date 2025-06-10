// src/app/api/company-jobs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY_ADMIN") {
    console.log("Unauthorized access attempt:", session?.user);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const company = await prisma.company.findUnique({
      where: { adminId: session.user.id },
      select: { id: true, name: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: `No company found for admin ID: ${session.user.id}` },
        { status: 404 }
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
