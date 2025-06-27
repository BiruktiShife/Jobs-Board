import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { uploadFile } from "@/lib/pinata";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const isResume = type === "resume" || type === "company-license";
    const isCompanyRegistration =
      type === "company-registration" ||
      type === "profile" ||
      type === "company-license";

    const session = await getServerSession(authOptions);

    // Allow unauthenticated uploads for company registration
    if (!session?.user?.id && !isCompanyRegistration) {
      console.error("Pinata upload route: Unauthorized, no session or user ID");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("Pinata upload route: No file provided");
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    console.log(
      "Pinata upload route: Received file:",
      file.name,
      "Type:",
      type,
      "Authenticated:",
      !!session?.user?.id
    );

    const urlResult = await uploadFile(
      file,
      isResume,
      session?.user?.id,
      isCompanyRegistration,
      type || undefined
    );
    console.log("Pinata upload route: Upload successful, URL:", urlResult);
    return NextResponse.json({ url: urlResult });
  } catch (error) {
    console.error("Pinata upload route: Error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 }
    );
  }
}
