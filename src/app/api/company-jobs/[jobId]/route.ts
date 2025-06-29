import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COMPANY_ADMIN") {
    console.log("Unauthorized access attempt:", session?.user);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;

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
        companyId: company.id,
      },
      include: {
        applications: true,
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
