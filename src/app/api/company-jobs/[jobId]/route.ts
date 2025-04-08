import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY_ADMIN") {
    console.log("Unauthorized access attempt:", session?.user);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { adminId: session.user.id },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: `No company found for admin ID: ${session.user.id}` },
        { status: 404 }
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
        companyId: company.id, // Ensure the job belongs to the company
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

    if (!job) {
      return NextResponse.json(
        { error: `Job with ID ${jobId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error(`Error fetching job ${jobId}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch job details" },
      { status: 500 }
    );
  }
}
