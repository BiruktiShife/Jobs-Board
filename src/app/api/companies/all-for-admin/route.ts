import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    console.log("Unauthorized access attempt:", session?.user);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const companies = await prisma.company.findMany({
      select: {
        name: true,
        admin: {
          select: { email: true },
        },
      },
    });

    console.log("Raw companies data from Prisma:", companies);

    const formattedCompanies = companies.map((company) => ({
      name: company.name,
      adminEmail: company.admin?.email || "N/A",
    }));

    console.log("Formatted companies data:", formattedCompanies);

    return NextResponse.json(formattedCompanies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
