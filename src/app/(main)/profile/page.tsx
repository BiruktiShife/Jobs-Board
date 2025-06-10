"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { MultiSelect } from "@/components/ui/multi-select";

export default function ManageProfile() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studyArea, setStudyArea] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initialName, setInitialName] = useState("");
  const [initialPhone, setInitialPhone] = useState("");
  const [initialStudyArea, setInitialStudyArea] = useState<string[]>([]);
  const [, setInitialProfileImage] = useState<string>("");

  const studyAreaOptions = [
    "Programming",
    "Business",
    "Healthcare",
    "Education",
    "Design",
    "Finance",
    "Engineering",
    "Sales",
    "Marketing",
    "Data Science",
    "Human Resources",
    "Product Management",
    "Operations",
    "Logistics",
    "Research",
    "Customer Support",
  ].map((area: string) => ({
    value: area,
    label: area,
  }));

  const pinataRewriteUrl = (url: string | null | undefined): string => {
    if (!url) return "";
    try {
      const cidMatch = url.match(/ipfs\/([^/]+)/);
      const cid = cidMatch?.[1];
      return cid
        ? `https://silver-accepted-barracuda-955.mypinata.cloud/ipfs/${cid}`
        : url;
    } catch {
      return url;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setStudyArea(
          data.studyArea
            ? Array.isArray(data.studyArea)
              ? data.studyArea
              : [data.studyArea]
            : []
        );
        setProfileImage(pinataRewriteUrl(data.image) || "");
        // Set initial values
        setInitialName(data.name || "");
        setInitialPhone(data.phone || "");
        setInitialStudyArea(
          data.studyArea
            ? Array.isArray(data.studyArea)
              ? data.studyArea
              : [data.studyArea]
            : []
        );
        setInitialProfileImage(pinataRewriteUrl(data.image) || "");
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session]);

  // Update hasChanges to compare string arrays
  const hasChanges =
    name !== initialName ||
    phone !== initialPhone ||
    JSON.stringify(studyArea.sort()) !==
      JSON.stringify(initialStudyArea.sort()) ||
    file !== null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    let imageUrl = profileImage;

    if (file) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log("Pinata upload attempt:", attempt);
          const formData = new FormData();
          formData.append("file", file);
          const response = await fetch("/api/pinata/upload", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || "Failed to upload image");
          }

          imageUrl = data.url;
          console.log("Pinata upload success:", imageUrl);
          break;
        } catch (err) {
          console.error("Pinata upload error (attempt", attempt, "):", err);
          if (attempt === 3) {
            setError(
              "Failed to upload image after multiple attempts. Please try again."
            );
            setIsSubmitting(false);
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    try {
      const profileData = {
        name,
        phone,
        studyArea,
        image: imageUrl,
      };

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (response.ok) {
        const refreshedProfile = await fetch("/api/user/profile");
        const updatedData = await refreshedProfile.json();
        setName(updatedData.name || "");
        setEmail(updatedData.email || "");
        setPhone(updatedData.phone || "");
        setStudyArea(
          updatedData.studyArea
            ? Array.isArray(updatedData.studyArea)
              ? updatedData.studyArea
              : [updatedData.studyArea]
            : []
        );
        setProfileImage(pinataRewriteUrl(updatedData.image));

        // Update initial values after successful save
        setInitialName(updatedData.name || "");
        setInitialPhone(updatedData.phone || "");
        setInitialStudyArea(
          updatedData.studyArea
            ? Array.isArray(updatedData.studyArea)
              ? updatedData.studyArea
              : [updatedData.studyArea]
            : []
        );
        setInitialProfileImage(pinataRewriteUrl(updatedData.image));
        setFile(null);
        setPreview(null);
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
        window.dispatchEvent(new Event("profileUpdated"));
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-green-100">
        <p className="text-lg text-gray-700 font-medium">
          Please log in to manage your profile.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-green-100">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors duration-200">
          <Link
            href={
              session?.user?.role === "ADMIN"
                ? "/admin"
                : session?.user?.role === "COMPANY_ADMIN"
                ? "/dashboard/company"
                : "/job-seeker"
            }
            className="flex items-center gap-2 hover:scale-105 transform transition-transform duration-200"
          >
            <BsArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100 pb-7 space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Manage Profile
            </CardTitle>
            <p className="text-gray-500 text-sm">
              Update your information and manage your preferences
            </p>
          </CardHeader>
          <CardContent className="pt-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  {preview || profileImage ? (
                    <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-green-100 shadow-md group-hover:shadow-xl group-hover:border-green-200 transition-all duration-300">
                      <Image
                        src={preview || profileImage}
                        alt="Profile Preview"
                        fill
                        className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                        onError={() => setProfileImage("")}
                      />
                    </div>
                  ) : (
                    <Avatar className="w-36 h-36 border-4 border-green-100 shadow-md group-hover:shadow-xl group-hover:border-green-200 transition-all duration-300">
                      <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-50 text-green-700 text-5xl font-medium">
                        {name ? name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <label
                    htmlFor="profileImage"
                    className="absolute -bottom-2 -right-2 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                  >
                    <Upload className="w-5 h-5" />
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                  JPG, GIF or PNG. Max 2MB
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full transition-all duration-200 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="w-full bg-gray-50/80 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="phone" className="text-gray-700 font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full transition-all duration-200 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {session?.user?.role === "JOB_SEEKER" && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="studyArea"
                      className="text-gray-700 font-medium"
                    >
                      Study Area
                    </Label>
                    <p className="text-sm text-gray-500 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                      Choose your study areas to see recommended jobs that match
                      your interests and expertise. This helps us provide more
                      relevant job suggestions.
                    </p>
                  </div>
                  <div className="relative">
                    <MultiSelect
                      selected={studyArea}
                      options={studyAreaOptions}
                      onChange={setStudyArea}
                      className="w-full"
                      placeholder="Select your areas of study"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50/80 p-4 rounded-lg border border-red-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50/80 p-4 rounded-lg border border-green-100">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{success}</p>
                </div>
              )}

              <Button
                type="submit"
                className={cn(
                  "w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium py-2.5 rounded-lg transition-all duration-300 transform hover:translate-y-[-1px] hover:shadow-lg",
                  (!hasChanges || isSubmitting) &&
                    "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none"
                )}
                disabled={!hasChanges || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
