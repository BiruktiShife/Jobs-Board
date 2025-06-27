import { PinataSDK } from "pinata";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: "https://gateway.pinata.cloud",
});

export async function uploadFile(
  file: File,
  isResume: boolean = false,
  userId?: string,
  allowAnonymous: boolean = false,
  uploadType?: string
): Promise<string> {
  // If userId is provided, use it; otherwise get from session
  let finalUserId = userId;

  if (!finalUserId) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      if (!allowAnonymous) {
        console.error("Pinata upload: Unauthorized, no session or user ID");
        throw new Error("Unauthorized");
      }
      // For anonymous uploads (like company registration)
      finalUserId = "anonymous";
      console.log("Pinata upload: Proceeding with anonymous upload");
    } else {
      finalUserId = session.user.id;
    }
  }

  const allowedTypes = isResume
    ? ["application/pdf"]
    : ["image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    console.error("Pinata upload: Invalid file type:", file.type);
    throw new Error(
      isResume
        ? "Only PDF files are allowed"
        : "Only image files (JPG, PNG, GIF) are allowed"
    );
  }

  const maxSize = isResume ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for resumes, 5MB for images
  if (file.size > maxSize) {
    console.error("Pinata upload: File size exceeds limit:", file.size);
    throw new Error(
      isResume ? "File size exceeds 10MB limit" : "File size exceeds 5MB limit"
    );
  }

  try {
    console.log(
      "Pinata upload: Starting upload for user:",
      finalUserId,
      "File:",
      file.name
    );
    // Determine file type for metadata
    let fileType = "profile";
    let fileName = `profile-${finalUserId}-${Date.now()}`;

    if (uploadType === "company-license") {
      fileType = "company-license";
      fileName = `license-${finalUserId}-${Date.now()}`;
    } else if (isResume) {
      fileType = "resume";
      fileName = `resume-${finalUserId}-${Date.now()}`;
    }

    const upload = await pinata.upload.public.file(file, {
      metadata: {
        name: fileName,
        keyvalues: {
          userId: finalUserId,
          type: fileType,
        },
      },
    });
    const url = `https://gateway.pinata.cloud/ipfs/${upload.cid}`;
    console.log("Pinata upload: Success, CID:", upload.cid, "URL:", url);

    // Verify pinning
    try {
      const pinList = await pinata.files.public.list().cid(upload.cid);
      if (pinList.files.length === 0) {
        console.error("Pinata upload: File not pinned, CID:", upload.cid);
        throw new Error("File was uploaded but not pinned");
      }
      console.log("Pinata upload: File pinned successfully, CID:", upload.cid);
    } catch (pinError) {
      console.error("Pinata upload: Pin verification failed:", pinError);
      throw new Error(
        `Failed to verify file pinning: ${
          pinError instanceof Error ? pinError.message : String(pinError)
        }`
      );
    }

    // Retry accessibility check
    let accessible = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(
          `Pinata upload: Accessibility check attempt ${attempt}, URL:`,
          url
        );
        const response = await fetch(url, { method: "HEAD" });
        if (!response.ok) {
          console.error(
            "Pinata upload: File not accessible, URL:",
            url,
            "Status:",
            response.status,
            "StatusText:",
            response.statusText
          );
          throw new Error(
            `Uploaded file is not accessible: ${response.statusText}`
          );
        }
        console.log("Pinata upload: File accessible, URL:", url);
        accessible = true;
        break;
      } catch (accessError) {
        console.error(
          "Pinata upload: Accessibility check failed (attempt",
          attempt,
          "):",
          accessError
        );
        if (attempt === 3) {
          console.warn(
            "Pinata upload: All accessibility checks failed, proceeding without verification"
          );
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
      }
    }

    if (!accessible) {
      console.warn(
        "Pinata upload: File may not be immediately accessible but is pinned:",
        url
      );
    }

    return url;
  } catch (error) {
    console.error(
      "Pinata upload: Detailed error:",
      error instanceof Error ? error.message : String(error),
      error
    );
    throw new Error(
      `Failed to upload file to Pinata: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
