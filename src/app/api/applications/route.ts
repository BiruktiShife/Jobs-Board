import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const applicationSchema = z.object({
  jobId: z.string(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  yearOfBirth: z.number().int().min(1900).max(new Date().getFullYear()),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  portfolio: z.string().url().optional(),
  profession: z.string().min(1, "Profession is required"),
  careerLevel: z.string().min(1, "Career level is required"),
  coverLetter: z.string().min(1, "Cover letter is required"),
  experiences: z
    .array(
      z.object({
        jobTitle: z.string().min(1, "Job title is required"),
        company_name: z.string().min(1, "Company name is required"),
        location: z.string().min(1, "Location is required"),
        responsibilities: z.string().min(1, "Responsibilities are required"),
      })
    )
    .min(1, "At least one experience is required"),
  degreeType: z.string().min(1, "Degree type is required"),
  institution: z.string().min(1, "Institution is required"),
  graduationDate: z.string().transform((val) => new Date(val)),
  skills: z.array(z.string()).max(5),
  certifications: z.array(z.string()).max(5),
  languages: z.array(z.string()).max(5),
  projects: z.string().optional(),
  volunteerWork: z.string().optional(),
  resumeUrl: z.string().min(1, "Resume is required").optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "JOB_SEEKER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = applicationSchema.parse({
      ...body,
      email: session.user.email,
    });

    // Check for existing application
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId: data.jobId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 409 }
      );
    }

    // Create new application
    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        jobId: data.jobId,
        fullName: data.fullName,
        email: data.email,
        yearOfBirth: data.yearOfBirth,
        address: data.address,
        phone: data.phone,
        portfolio: data.portfolio,
        profession: data.profession,
        careerLevel: data.careerLevel,
        coverLetter: data.coverLetter,
        experiences: data.experiences,
        degreeType: data.degreeType,
        institution: data.institution,
        graduationDate: data.graduationDate,
        skills: data.skills,
        certifications: data.certifications,
        languages: data.languages,
        projects: data.projects,
        volunteerWork: data.volunteerWork,
        resumeUrl: data.resumeUrl,
      },
    });

    return NextResponse.json(
      {
        message: "Application submitted successfully",
        applicationId: application.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error submitting application:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
