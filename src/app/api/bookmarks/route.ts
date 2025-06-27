import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await request.json();
  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
  }

  if (typeof jobId !== "string" || !jobId.trim()) {
    return NextResponse.json({ error: "Invalid Job ID" }, { status: 400 });
  }

  try {
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId: jobId, // Use jobId as a string
        },
      },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      return NextResponse.json({ bookmarked: false }, { status: 200 });
    } else {
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          jobId: jobId,
        },
      });
      return NextResponse.json({ bookmarked: true }, { status: 201 });
    }
  } catch (error) {
    console.error("Bookmark error:", error);
    return NextResponse.json(
      { error: "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: session.user.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            area: true,
            logo: true,
            about_job: true,
            location: true,
            deadline: true,
            site: true,
            qualifications: { select: { value: true } },
            responsibilities: { select: { value: true } },
            requiredSkills: { select: { value: true } },
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const jobs = bookmarks.map((bookmark) => ({
      id: bookmark.job.id.toString(),
      title: bookmark.job.title,
      area: bookmark.job.area,
      company_name: bookmark.job.company.name,
      logo: bookmark.job.logo || "/default-logo.png",
      about_job: bookmark.job.about_job,
      location: bookmark.job.location,
      deadline: bookmark.job.deadline.toISOString().split("T")[0],
      site: bookmark.job.site,
      qualifications: bookmark.job.qualifications.map((q) => q.value),
      responsibilities: bookmark.job.responsibilities.map((r) => r.value),
      requiredSkills: bookmark.job.requiredSkills.map((s) => s.value),
    }));

    return NextResponse.json(jobs, { status: 200 });
  } catch (error) {
    console.error("Fetch bookmarks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await request.json();
  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
  }

  try {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.id,
        jobId: jobId,
      },
    });

    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    await prisma.bookmark.delete({
      where: {
        id: bookmark.id,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete bookmark error:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
}
