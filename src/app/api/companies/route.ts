import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const adminId = searchParams.get("adminId");
  const status = searchParams.get("status");

  try {
    if (!session?.user?.id) {
      console.error("Companies: Unauthorized access attempt, no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Log session role for debugging
    console.log("Companies: Session user role:", session.user.role);

    // Only admins can query by status or access other users' companies
    if (
      session.user.role !== "ADMIN" &&
      (status || (adminId && adminId !== session.user.id))
    ) {
      console.error(
        "Companies: Forbidden access attempt by non-admin, userId:",
        session.user.id,
        "query:",
        { adminId, status }
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const where: any = {};
    if (adminId) {
      where.adminId = adminId;
    }
    if (status) {
      where.status = status.toUpperCase(); // Ensure PENDING, APPROVED, REJECTED
    }

    const companies = await prisma.company.findMany({
      where,
      select: {
        id: true,
        name: true,
        adminEmail: true,
        adminId: true,
        address: true,
        logo: true,
        licenseUrl: true,
        status: true,
        createdAt: true,
      },
    });

    const formattedCompanies = companies.map((company) => ({
      id: company.id,
      name: company.name,
      adminEmail: company.adminEmail,
      adminId: company.adminId,
      address: company.address,
      logo: company.logo,
      licenseUrl: company.licenseUrl,
      status: company.status,
      createdAt: company.createdAt.toISOString(),
    }));

    console.log(
      "Companies: Fetched",
      formattedCompanies.length,
      "companies for query:",
      { adminId, status }
    );
    return NextResponse.json(formattedCompanies);
  } catch (error) {
    console.error("Companies error:", error);
    if (error instanceof Error && error.message.includes("fetch failed")) {
      return NextResponse.json(
        { error: "Database connection failed. Please try again later." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch companies",
      },
      { status: 500 }
    );
  }
}
