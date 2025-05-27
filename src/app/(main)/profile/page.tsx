"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader2,
  Upload,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Phone,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { motion } from "framer-motion";
import { MultiSelect } from "@/components/ui/multi-select"; // Replace with your actual MultiSelect component

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
  ];

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

  // Determine if there are any changes
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
    if (!hasChanges) return; // Prevent submission if no changes
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
      const profileData = { name, phone, studyArea, image: imageUrl };
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <Card className="w-full shadow-lg rounded-xl overflow-hidden border-0">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 relative">
            <div className="absolute top-4 left-4">
              <Link
                href={
                  session?.user?.role === "COMPANY_ADMIN"
                    ? "/dashboard/company"
                    : "/dashboard"
                }
                className="text-white hover:text-green-200 transition-colors"
              >
                <BsArrowLeft className="w-6 h-6" />
              </Link>
            </div>
            <div className="text-center pt-2">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <User className="w-6 h-6" />
                Edit Profile
              </CardTitle>
              <p className="text-green-100 mt-1 text-sm">
                Update your personal information
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-6 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  {preview || profileImage ? (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-green-100 shadow-md group-hover:shadow-lg transition-all">
                      <Image
                        src={preview || profileImage}
                        alt="Profile Preview"
                        fill
                        className="object-cover"
                        onError={() => setProfileImage("")}
                      />
                    </div>
                  ) : (
                    <Avatar className="w-32 h-32 border-4 border-green-100 shadow-md">
                      <AvatarFallback className="bg-green-100 text-green-700 text-4xl font-medium">
                        {name ? name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <label
                    htmlFor="profileImage"
                    className="absolute -bottom-2 -right-2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full cursor-pointer transition-all shadow-lg flex items-center justify-center"
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
                <p className="text-xs text-gray-500 mt-3">
                  JPG, GIF or PNG. Max 2MB
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label
                    htmlFor="name"
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <User className="w-4 h-4 text-green-600" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., John Doe"
                    className="focus:ring-green-500 focus:border-green-500 border-gray-300"
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <Mail className="w-4 h-4 text-green-600" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <Phone className="w-4 h-4 text-green-600" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., +251 923-456-7891"
                    className="focus:ring-green-500 focus:border-green-500 border-gray-300"
                  />
                </div>

                {session?.user?.role === "JOB_SEEKER" && (
                  <div className="space-y-1">
                    <Label
                      htmlFor="studyArea"
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <BookOpen className="w-4 h-4 text-green-600" />
                      Study Areas
                    </Label>
                    <MultiSelect
                      options={studyAreaOptions.map((option) => ({
                        value: option,
                        label: option,
                      }))}
                      selected={studyArea}
                      onChange={setStudyArea}
                      placeholder="Select your study areas"
                      className="focus:ring-green-500 focus:border-green-500 border-gray-300"
                    />
                  </div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-md border border-red-200"
                >
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-3 bg-green-50 text-green-700 rounded-md border border-green-200"
                >
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{success}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !hasChanges}
                className={cn(
                  "w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-all shadow-md",
                  "flex items-center justify-center gap-2",
                  (isSubmitting || !hasChanges) &&
                    "opacity-80 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
