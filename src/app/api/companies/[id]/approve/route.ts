import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      console.error("Company approve: Unauthorized, user:", session?.user);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    if (!["APPROVED", "REJECTED"].includes(status)) {
      console.error("Company approve: Invalid status:", status);
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const company = await prisma.company.update({
      where: { id: params.id },
      data: { status },
    });

    console.log(
      "Company approve: Updated company ID:",
      params.id,
      "to status:",
      status
    );
    return NextResponse.json({
      message: `Company ${status.toLowerCase()} successfully`,
      company,
    });
  } catch (error) {
    console.error("Company approve error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update company",
      },
      { status: 500 }
    );
  }
}
