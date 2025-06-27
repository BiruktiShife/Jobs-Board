import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user.email ||
    session.user.role !== "COMPANY_ADMIN"
  ) {
    console.error(
      "GET /api/company/profile: Unauthorized, no session or not a company admin"
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const company = await prisma.company.findFirst({
      where: { adminEmail: session.user.email },
      select: {
        id: true,
        name: true,
        adminEmail: true,
        address: true,
        logo: true,
        licenseUrl: true,
        status: true,
        createdAt: true,
      },
    });

    if (!company) {
      console.error(
        `GET /api/company/profile: Company not found for admin email ${session.user.email}`
      );
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error(
      "GET /api/company/profile: Error fetching company profile:",
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user.email ||
    session.user.role !== "COMPANY_ADMIN"
  ) {
    console.error(
      "PUT /api/company/profile: Unauthorized, no session or not a company admin"
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, address, logo } = data;

    const company = await prisma.company.findFirst({
      where: { adminEmail: session.user.email },
    });

    if (!company) {
      console.error(
        `PUT /api/company/profile: Company not found for admin email ${session.user.email}`
      );
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        name,
        address,
        logo,
      },
      select: {
        id: true,
        name: true,
        adminEmail: true,
        address: true,
        logo: true,
        licenseUrl: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error(
      "PUT /api/company/profile: Error updating company profile:",
      error
    );
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
