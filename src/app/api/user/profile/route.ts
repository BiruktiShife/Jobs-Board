// src/app/api/user/profile/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { writeFile } from "fs/promises";
import path from "path";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { name: true, email: true, image: true },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const file = formData.get("profileImage") as File | null;

    let profileImageUrl = null;
    if (file) {
      const fileExtension = file.name.split(".").pop();
      const fileName = `${session.user.email}-${Date.now()}.${fileExtension}`;
      const filePath = path.join(process.cwd(), "public", fileName);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      profileImageUrl = `/${fileName}`;
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || undefined,
        image: profileImageUrl || undefined,
      },
      select: { name: true, email: true, image: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
