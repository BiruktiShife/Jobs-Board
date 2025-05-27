import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.email) {
    console.error("GET /api/user/profile: Unauthorized, no session or email");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        email: true,
        image: true,
        phone: true,
        studyArea: true,
      },
    });
    if (!user) {
      console.error(
        `GET /api/user/profile: User not found for email ${session.user.email}`
      );
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/user/profile: Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.email) {
    console.error("PUT /api/user/profile: Unauthorized, no session or email");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, phone, studyArea, image } = await request.json();
    console.log("PUT /api/user/profile: Request data:", {
      name,
      phone,
      studyArea,
      image,
    });

    if (image && !isValidUrl(image)) {
      console.error("PUT /api/user/profile: Invalid image URL:", image);
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    // Validate studyArea as an array
    if (
      studyArea &&
      (!Array.isArray(studyArea) ||
        !studyArea.every((item) => typeof item === "string"))
    ) {
      console.error(
        "PUT /api/user/profile: Invalid studyArea format:",
        studyArea
      );
      return NextResponse.json(
        { error: "Invalid studyArea format" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      console.error(
        `PUT /api/user/profile: User not found for email ${session.user.email}`
      );
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        studyArea: studyArea || undefined,
        image: image || undefined,
      },
      select: {
        name: true,
        email: true,
        image: true,
        phone: true,
        studyArea: true,
      },
    });

    console.log(
      "PUT /api/user/profile: Profile updated successfully:",
      updatedUser
    );
    console.log("PUT /api/user/profile: Stored image URL:", updatedUser.image);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT /api/user/profile: Error updating profile:", error);
    return NextResponse.json(
      {
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return (
      url.startsWith("https://gateway.pinata.cloud/ipfs/") ||
      url.startsWith(
        "https://silver-accepted-barracuda-955.mypinata.cloud/ipfs/"
      )
    );
  } catch {
    return false;
  }
}
