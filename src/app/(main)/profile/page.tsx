// src/app/profile/manage/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { motion } from "framer-motion";

export default function ManageProfile() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studyArea, setStudyArea] = useState<string>(""); // Study area as string
  const [profileImage, setProfileImage] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Define study area options
  const studyAreaOptions = [
    "Programming",
    "Business",
    "Healthcare",
    "Education",
    "Design",
    "Finance",
    "Engineering",
    "Sales",
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setStudyArea(data.studyArea || ""); // Ensure it matches an option or empty
        setProfileImage(data.image || "");
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
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    if (name) formData.append("name", name);
    if (phone) formData.append("phone", phone);
    if (studyArea) formData.append("studyArea", studyArea); // Send selected study area
    if (file) formData.append("profileImage", file);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setName(updatedUser.name || "");
        setEmail(updatedUser.email || "");
        setPhone(updatedUser.phone || "");
        setStudyArea(updatedUser.studyArea || "");
        setProfileImage(updatedUser.image || "");
        setFile(null);
        setPreview(null);
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
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
    <div className="bg-gradient-to-br from-gray-50 to-green-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-xl rounded-xl overflow-hidden border border-gray-200">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6">
            <div className="flex items-center justify-between">
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
              <div>
                <CardTitle className="text-2xl font-semibold">
                  Edit Profile
                </CardTitle>
                <p className="text-sm text-green-100 mt-1">
                  Keep your information up-to-date
                </p>
              </div>
              <div className="w-6" /> {/* Spacer */}
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  {preview || profileImage ? (
                    <Image
                      src={preview || profileImage}
                      alt="Profile Preview"
                      width={120}
                      height={120}
                      className="rounded-full object-cover border-4 border-white shadow-lg transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <Avatar className="w-32 h-32">
                      <AvatarFallback className="bg-green-100 text-green-700 text-4xl font-medium">
                        {name ? name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <label
                    htmlFor="profileImage"
                    className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full cursor-pointer hover:bg-green-700 transition-all shadow-md group-hover:scale-110"
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
                <p className="text-sm text-gray-600 mt-3 font-light">
                  Upload a professional headshot
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-800"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., John Doe"
                    className="mt-1 border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-800"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="mt-1 border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-800"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., +251 923-456-7891"
                    className="mt-1 border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  {session?.user?.role === "JOB_SEEKER" && (
                    <>
                      <Label
                        htmlFor="studyArea"
                        className="text-sm font-medium text-gray-800"
                      >
                        Study Area
                      </Label>
                      <Select onValueChange={setStudyArea} value={studyArea}>
                        <SelectTrigger className="mt-1 border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm">
                          <SelectValue placeholder="Select your study area" />
                        </SelectTrigger>
                        <SelectContent>
                          {studyAreaOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center text-sm text-red-700 bg-red-100 p-3 rounded-md shadow-sm"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center text-sm text-green-700 bg-green-100 p-3 rounded-md shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {success}
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 shadow-md",
                  isSubmitting && "opacity-70 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
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
      </motion.div>
    </div>
  );
}
