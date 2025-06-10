import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { hash } from "bcryptjs";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        admin: { select: { email: true } },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: company.id,
      name: company.name,
      logo: company.logo,
      about: company.about,
      adminEmail: company.admin?.email || null,
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const logoFile = formData.get("logo") as File | null;
    const about = formData.get("about") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string | null;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    let logoUrl: string | null = null;
    if (logoFile) {
      const fileName = `${Date.now()}-${logoFile.name}`;
      const filePath = path.join(process.cwd(), "public", fileName);
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      await writeFile(filePath, buffer);
      logoUrl = `/${fileName}`;
    }

    const company = await prisma.company.findUnique({
      where: { id },
      include: { admin: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const updatedCompany = await prisma.$transaction(async (prisma) => {
      let adminId = company.adminId;
      if (email !== company.admin?.email || password) {
        const hashedPassword = password ? await hash(password, 10) : null;
        const admin = await prisma.user.upsert({
          where: { email: company.admin?.email || email },
          update: {
            email,
            ...(hashedPassword && { password: hashedPassword }),
            role: "COMPANY_ADMIN",
          },
          create: {
            email,
            password: hashedPassword!,
            role: "COMPANY_ADMIN",
            name: `Admin ${name}`,
          },
        });
        adminId = admin.id;
      }

      return prisma.company.update({
        where: { id },
        data: {
          name,
          logo: logoUrl || company.logo,
          about: about || null,
          adminId,
        },
      });
    });

    return NextResponse.json({
      message: `Company "${updatedCompany.name}" updated successfully`,
      company: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    console.log(`Attempting to delete company with ID: ${id}`);

    const company = await prisma.company.findUnique({
      where: { id },
      select: { adminId: true, logo: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    await prisma.$transaction(async (prisma) => {
      // Delete admin user if exists
      if (company.adminId) {
        await prisma.user.delete({
          where: { id: company.adminId },
        });
      }

      // Delete company (cascades to jobs and related records)
      await prisma.company.delete({
        where: { id },
      });

      // Optionally delete logo file
      if (company.logo) {
        const filePath = path.join(
          process.cwd(),
          "public",
          company.logo.slice(1)
        );
        try {
          await unlink(filePath);
          console.log(`Deleted logo file: ${filePath}`);
        } catch (err) {
          console.warn(`Failed to delete logo file: ${filePath}`, err);
        }
      }
    });

    console.log(`Successfully deleted company with ID: ${id}`);
    return NextResponse.json(
      { message: "Company deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 500 }
    );
  }
}
