import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const logoFile = formData.get("logo") as File | null;
    const about = formData.get("about") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    let logoUrl = "";
    if (logoFile) {
      const fileName = `${Date.now()}-${logoFile.name}`;
      const filePath = path.join(process.cwd(), "public", fileName);
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      await writeFile(filePath, buffer);
      logoUrl = `/${fileName}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "COMPANY_ADMIN",
        },
      });

      return prisma.company.create({
        data: {
          name,
          logo: logoUrl || null,
          about,
          adminId: user.id,
        },
      });
    });

    return NextResponse.json(
      { message: `Company "${company.name}" created successfully`, company },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create company error:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const adminId = searchParams.get("adminId");

  if (adminId) {
    try {
      const company = await prisma.company.findUnique({
        where: { adminId },
        select: { id: true, name: true, logo: true },
      });
      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      return NextResponse.json(
        { error: "Failed to fetch company" },
        { status: 500 }
      );
    }
  }

  const companies = await prisma.company.findMany({
    select: { id: true, name: true, logo: true },
  });
  return NextResponse.json(companies);
}
