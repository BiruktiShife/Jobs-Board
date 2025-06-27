import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const applications = await prisma.application.findMany({
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const applicantData = applications.map((app) => ({
      id: app.id,
      name: app.user.name,
      email: app.user.email,
      job: {
        id: app.job.id, // Include job.id
        title: app.job.title,
        company: {
          name: app.job.company.name,
        },
      },
      jobId: app.job.id, // Add jobId for filtering
      jobTitle: app.job.title,
      company: app.job.company.name,
      appliedOn: app.createdAt.toISOString().split("T")[0],
    }));

    return NextResponse.json(applicantData, { status: 200 });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { error: "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}
