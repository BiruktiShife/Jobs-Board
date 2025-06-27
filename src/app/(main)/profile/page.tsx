"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Upload,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Phone,
  GraduationCap,
  Camera,
  Save,
  ArrowLeft,
  Edit,
  Star,
  Award,
  Target,
  Briefcase,
  Settings,
  Shield,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { MultiSelect } from "@/components/ui/multi-select";
import { Loading } from "@/components/ui/loading";

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Authentication Required
          </h2>
          <p className="text-gray-600 max-w-md">
            Please log in to access and manage your profile information.
          </p>
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading variant="page" text="Loading your profile" icon="user" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href={
              session?.user?.role === "ADMIN"
                ? "/admin"
                : session?.user?.role === "COMPANY_ADMIN"
                  ? "/dashboard/company"
                  : "/job-seeker"
            }
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>

        {/* Profile Header Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 h-32"></div>
            <div className="absolute inset-0 bg-black/20 h-32"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>

            <CardHeader className="relative pt-8 pb-16">
              <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6">
                {/* Profile Picture */}
                <div className="relative group">
                  {preview || profileImage ? (
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-300">
                      <Image
                        src={preview || profileImage}
                        alt="Profile Preview"
                        fill
                        className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                        onError={() => setProfileImage("")}
                      />
                    </div>
                  ) : (
                    <Avatar className="w-32 h-32 border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-300">
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 text-4xl font-bold">
                        {name ? name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <label
                    htmlFor="profileImage"
                    className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 flex items-center justify-center"
                  >
                    <Camera className="w-5 h-5" />
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Profile Info */}
                <div className="text-center lg:text-left text-white">
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                    {name || "Your Name"}
                  </h1>
                  <div className="flex flex-col lg:flex-row items-center lg:items-center gap-4 text-blue-100">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{email}</span>
                    </div>
                    {phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 mt-3">
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      <User className="w-3 h-3 mr-1" />
                      {session?.user?.role === "JOB_SEEKER"
                        ? "Job Seeker"
                        : session?.user?.role === "COMPANY_ADMIN"
                          ? "Company Admin"
                          : "Admin"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </div>
        </Card>

        {/* Profile Form Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-blue-600" />
                  Profile Settings
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Update your personal information and preferences
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Profile Active</span>
              </div>
            </div>
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

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="email"
                      value={email}
                      disabled
                      className="pl-10 h-12 bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              {session?.user?.role === "JOB_SEEKER" && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Study Areas & Expertise
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">
                            Smart Job Matching
                          </h4>
                          <p className="text-sm text-blue-700">
                            Select your study areas to receive personalized job
                            recommendations that match your expertise and
                            interests.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="studyArea"
                        className="text-sm font-medium text-gray-700"
                      >
                        Areas of Study
                      </Label>
                      <MultiSelect
                        selected={studyArea}
                        options={studyAreaOptions}
                        onChange={setStudyArea}
                        className="w-full"
                        placeholder="Select your areas of study and expertise"
                      />
                      <p className="text-xs text-gray-500">
                        Choose multiple areas that match your background and
                        interests
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">Error</h4>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">
                        Success
                      </h4>
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={!hasChanges || isSubmitting}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Updating Profile...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 h-12"
                  onClick={() => {
                    // Reset form to original values
                    setName(session?.user?.name || "");
                    setPhone(session?.user?.phone || "");
                    setStudyArea(session?.user?.studyArea || []);
                    setPreview(null);
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
