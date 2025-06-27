import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  sendCompanyApprovalEmail,
  sendCompanyRejectionEmail,
} from "@/app/lib/resend";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { status, reason } = await request.json();

    // Validate status
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update company status
    const company = await prisma.company.update({
      where: { id: params.id },
      data: { status },
      select: {
        name: true,
        adminEmail: true,
        admin: {
          select: {
            email: true,
          },
        },
      },
    });

    // Send email notification to company admin
    try {
      if (status === "APPROVED") {
        await sendCompanyApprovalEmail(company.name, company.adminEmail);
        console.log(
          `Approval email sent to ${company.adminEmail} for company ${company.name}`
        );
      } else if (status === "REJECTED") {
        await sendCompanyRejectionEmail(
          company.name,
          company.adminEmail,
          reason
        );
        console.log(
          `Rejection email sent to ${company.adminEmail} for company ${company.name}`
        );
      }
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the status update if email fails
    }

    return NextResponse.json({
      message: `Company ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("Error updating company status:", error);
    return NextResponse.json(
      { error: "Failed to update company status" },
      { status: 500 }
    );
  }
}
