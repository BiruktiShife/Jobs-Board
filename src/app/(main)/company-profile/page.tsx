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
  Building2,
  Building,
  Mail,
  MapPin,
  Camera,
  Save,
  ArrowLeft,
  Calendar,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Loading } from "@/components/ui/loading";

export default function ManageCompanyProfile() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState<string>("");
  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">(
    "PENDING"
  );
  const [createdAt, setCreatedAt] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initialName, setInitialName] = useState("");
  const [initialAddress, setInitialAddress] = useState("");
  const [, setInitialLogo] = useState<string>("");

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
        const response = await fetch("/api/company/profile");
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setName(data.name || "");
        setEmail(data.adminEmail || "");
        setAddress(data.address || "");
        setLogo(pinataRewriteUrl(data.logo) || "");
        setStatus(data.status || "PENDING");
        setCreatedAt(data.createdAt || "");
        // Set initial values
        setInitialName(data.name || "");
        setInitialAddress(data.address || "");
        setInitialLogo(pinataRewriteUrl(data.logo) || "");
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session]);

  // Update hasChanges to compare values
  const hasChanges =
    name !== initialName || address !== initialAddress || file !== null;

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

    let logoUrl = logo;

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

          logoUrl = data.url;
          console.log("Pinata upload success:", logoUrl);
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
        address,
        logo: logoUrl,
      };

      const response = await fetch("/api/company/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (response.ok) {
        const refreshedProfile = await fetch("/api/company/profile");
        const updatedData = await refreshedProfile.json();
        setName(updatedData.name || "");
        setEmail(updatedData.adminEmail || "");
        setAddress(updatedData.address || "");
        setLogo(pinataRewriteUrl(updatedData.logo));

        // Update initial values after successful save
        setInitialName(updatedData.name || "");
        setInitialAddress(updatedData.address || "");
        setInitialLogo(pinataRewriteUrl(updatedData.logo));
        setFile(null);
        setPreview(null);
        setSuccess("Company profile updated successfully!");
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <Building className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Authentication Required
          </h2>
          <p className="text-gray-600 max-w-md">
            Please log in as a company admin to access and manage your company
            profile.
          </p>
          <Link href="/login/company">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Company Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <Loading variant="page" text="Loading company profile" icon="building" />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/company"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>

        {/* Company Header Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 h-32"></div>
            <div className="absolute inset-0 bg-black/20 h-32"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>

            <CardHeader className="relative pt-8 pb-16">
              <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6">
                {/* Company Logo */}
                <div className="relative group">
                  {preview || logo ? (
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-300">
                      <Image
                        src={preview || logo}
                        alt="Company Logo Preview"
                        fill
                        className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                        onError={() => setLogo("")}
                      />
                    </div>
                  ) : (
                    <Avatar className="w-32 h-32 border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-300">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 text-4xl font-bold">
                        <Building className="w-16 h-16" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <label
                    htmlFor="logo"
                    className="absolute -bottom-2 -right-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 flex items-center justify-center"
                  >
                    <Camera className="w-5 h-5" />
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Company Info */}
                <div className="text-center lg:text-left text-white">
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                    {name || "Company Name"}
                  </h1>
                  <div className="flex flex-col lg:flex-row items-center lg:items-center gap-4 text-emerald-100">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{email}</span>
                    </div>
                    {address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{address}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-3 mt-3">
                    <Badge
                      className={`${
                        status === "APPROVED"
                          ? "bg-green-500/20 text-green-100 border-green-300/30"
                          : status === "PENDING"
                            ? "bg-yellow-500/20 text-yellow-100 border-yellow-300/30"
                            : "bg-red-500/20 text-red-100 border-red-300/30"
                      }`}
                    >
                      {status === "APPROVED" && (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      )}
                      {status === "PENDING" && (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {status === "REJECTED" && (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {status}
                    </Badge>
                    {createdAt && (
                      <Badge className="bg-white/20 text-white border-white/30">
                        <Calendar className="w-3 h-3 mr-1" />
                        Since {new Date(createdAt).getFullYear()}
                      </Badge>
                    )}
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
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-emerald-600" />
                  Company Settings
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Update your company information and preferences
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    status === "APPROVED"
                      ? "bg-green-500"
                      : status === "PENDING"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-600">
                  {status === "APPROVED"
                    ? "Verified Company"
                    : status === "PENDING"
                      ? "Pending Approval"
                      : "Needs Review"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  {preview || logo ? (
                    <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-green-100 shadow-md group-hover:shadow-xl group-hover:border-green-200 transition-all duration-300">
                      <Image
                        src={preview || logo}
                        alt="Company Logo Preview"
                        fill
                        className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                        onError={() => setLogo("")}
                      />
                    </div>
                  ) : (
                    <Avatar className="w-36 h-36 border-4 border-green-100 shadow-md group-hover:shadow-xl group-hover:border-green-200 transition-all duration-300">
                      <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-50 text-green-700">
                        <Building2 className="w-16 h-16" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <label
                    htmlFor="logo"
                    className="absolute -bottom-2 -right-2 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                  >
                    <Upload className="w-5 h-5" />
                    <Input
                      id="logo"
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

              {/* Company Information Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Building className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Company Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Company Name
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Enter your company name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Admin Email
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
                      Admin email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="address"
                      className="text-sm font-medium text-gray-700"
                    >
                      Company Address
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        placeholder="Enter your complete company address"
                      />
                    </div>
                  </div>
                </div>
              </div>

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
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Updating Company...
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
                    setName(initialName);
                    setAddress(initialAddress);
                    setPreview(null);
                    setFile(null);
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
