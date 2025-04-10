// src/app/profile/manage/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";

export default function ManageProfile() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState<string>(""); // URL from DB
  const [file, setFile] = useState<File | null>(null); // Local file
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null); // Image preview
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setName(data.name || "");
        setProfileImage(data.profileImage || "");
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null); // Clear any previous errors
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    if (name) formData.append("name", name);
    if (file) formData.append("profileImage", file);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setProfileImage(updatedUser.profileImage || "");
        setFile(null);
        setPreview(null);
        setSuccess("Profile updated successfully!");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">
          Please log in to manage your profile.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className=" text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-black">
            {session?.user?.role === "COMPANY_ADMIN" ? (
              <span className="flex items-start">
                <Link href="/dashboard/company">
                  <BsArrowLeft />{" "}
                </Link>
              </span>
            ) : (
              <span className="flex items-start">
                <Link href="/dashboard">
                  <BsArrowLeft />{" "}
                </Link>
              </span>
            )}

            <span className="flex justify-center">Edit Profile</span>
          </CardTitle>
          <p className="text-sm text-black flex flex-col items-center">
            Update your personal information
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                {preview || profileImage ? (
                  <Image
                    src={preview || profileImage}
                    alt="Profile Preview"
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <Avatar className="w-28 h-28">
                    <AvatarFallback className="bg-green-200 text-green-800 text-2xl">
                      {name ? name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <label
                  htmlFor="profileImage"
                  className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors"
                >
                  <Upload className="w-5 h-5 text-white" />
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Click to upload a new profile image
              </p>
            </div>

            {/* Name Field */}
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            {/* Feedback Messages */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-600 bg-green-50 p-2 rounded-md">
                {success}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
