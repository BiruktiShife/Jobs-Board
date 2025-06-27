import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const { name, email, password, address, logo, licenseUrl } =
      await request.json();

    // Validate input
    if (!name || !email || !password || !address) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { adminEmail: email },
    });

    if (existingCompany) {
      return NextResponse.json(
        { message: "Company with this email already exists" },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // First create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "COMPANY_ADMIN",
        name: name, // Use company name as the admin's name initially
      },
    });

    // Then create the company with the admin user
    const company = await prisma.company.create({
      data: {
        name,
        adminId: adminUser.id,
        adminEmail: email,
        address,
        logo: logo || "",
        licenseUrl: licenseUrl || "",
        status: "PENDING",
      },
      include: {
        admin: true,
      },
    });

    return NextResponse.json(
      {
        message:
          "Company registered successfully! Please wait for admin approval before you can log in.",
        company: {
          id: company.id,
          name: company.name,
          email: company.adminEmail,
          status: company.status,
        },
        admin: {
          id: company.admin.id,
          email: company.admin.email,
          role: company.admin.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Failed to register company" },
      { status: 500 }
    );
  }
}
