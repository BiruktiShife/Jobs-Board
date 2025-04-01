// src/app/api/jobs/route.ts
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
        applications: {
          select: {
            id: true,
            fullName: true,
            email: true,
            careerLevel: true,
            skills: true,
            degreeType: true,
            certifications: true,
            languages: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      companyName: company.name,
      jobs: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
