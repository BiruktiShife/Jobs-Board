"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import {
  Loader2,
  Upload,
  Building,
  Mail,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle,
  Star,
  Shield,
  ArrowRight,
  Briefcase,
  Target,
  Award,
  Zap,
  FileText,
  ImageIcon,
  Users,
  TrendingUp,
} from "lucide-react";

export default function CompanyRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [license, setLicense] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "license"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "logo") {
        // Validate logo file type
        if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
          toast.error("Only JPG, PNG, or GIF files are allowed for logo");
          return;
        }
        setLogo(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // Validate license file type
        if (file.type !== "application/pdf") {
          toast.error("Only PDF files are allowed for license");
          return;
        }
        setLicense(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Upload logo if exists
      let logoUrl = "";
      if (logo) {
        const formData = new FormData();
        formData.append("file", logo);
        const response = await fetch(
          "/api/pinata/upload?type=company-registration",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to upload logo");
        logoUrl = data.url;
      }

      // Upload license if exists
      let licenseUrl = "";
      if (license) {
        const formData = new FormData();
        formData.append("file", license);
        const response = await fetch(
          "/api/pinata/upload?type=company-license",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to upload license");
        licenseUrl = data.url;
      }

      // Register company
      const response = await fetch("/api/company/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          logo: logoUrl,
          licenseUrl: licenseUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to register company");

      toast.success("Registration successful! Please wait for admin approval.");
      router.push("/login/company");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to register company"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <div className="flex min-h-screen">
        {/* Left Side - Company Branding */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>

          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold">JobBoard</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">Join Our Network!</h1>
              <p className="text-xl text-teal-100 mb-8">
                Register your company and connect with top talent. Start
                building your dream team today.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Access 50K+ Candidates</h3>
                  <p className="text-teal-100 text-sm">
                    Reach qualified professionals
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Advanced Hiring Tools</h3>
                  <p className="text-teal-100 text-sm">
                    Streamline your recruitment process
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Smart Matching</h3>
                  <p className="text-teal-100 text-sm">
                    AI-powered candidate recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-3/5 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  JobBoard
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Company Registration
              </h1>
              <p className="text-gray-600">Join our network of employers</p>
            </div>

            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-2 pb-6">
                <div className="hidden lg:block text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    Register Your Company
                  </CardTitle>
                  <p className="text-gray-600">
                    Start hiring top talent today!
                  </p>
                </div>
                <Badge className="mx-auto bg-teal-100 text-teal-700 border-teal-200">
                  <Building className="h-3 w-3 mr-1" />
                  Employer Registration
                </Badge>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Company Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Building className="h-5 w-5 text-teal-600" />
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
                            placeholder="Enter company name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                            className="pl-10 h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-gray-700"
                        >
                          Company Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="company@example.com"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            required
                            className="pl-10 h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="password"
                          className="text-sm font-medium text-gray-700"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                            required
                            className="pl-10 pr-10 h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="confirmPassword"
                          className="text-sm font-medium text-gray-700"
                        >
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                confirmPassword: e.target.value,
                              })
                            }
                            required
                            className="pl-10 pr-10 h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
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
                            placeholder="Enter complete company address"
                            value={formData.address}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: e.target.value,
                              })
                            }
                            required
                            className="pl-10 h-12 border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Documents Section */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <FileText className="h-5 w-5 text-teal-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Company Documents
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Company Logo
                        </Label>
                        <div className="space-y-4">
                          <div className="relative w-32 h-32 mx-auto border-2 border-dashed border-teal-300 rounded-xl overflow-hidden bg-teal-50 hover:bg-teal-100 transition-colors group cursor-pointer">
                            {logoPreview ? (
                              <Image
                                src={logoPreview}
                                alt="Logo Preview"
                                fill
                                className="object-cover rounded-xl"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-teal-600">
                                <ImageIcon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-medium">
                                  Upload Logo
                                </span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/gif"
                              onChange={(e) => handleFileChange(e, "logo")}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                          <p className="text-xs text-gray-500 text-center">
                            JPG, PNG, or GIF (Max 5MB)
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Business License
                        </Label>
                        <div className="space-y-4">
                          <div className="relative">
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full h-32 border-2 border-dashed border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-600 hover:text-teal-700 flex flex-col items-center justify-center space-y-2"
                            >
                              <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => handleFileChange(e, "license")}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <FileText className="w-8 h-8" />
                              <span className="text-sm font-medium">
                                {license ? "Change License" : "Upload License"}
                              </span>
                            </Button>
                          </div>
                          {license && (
                            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">
                                {license.name}
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 text-center">
                            PDF format only (Max 10MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-lg"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="h-5 w-5 mr-2" />
                    )}
                    {loading ? "Creating Account..." : "Register Company"}
                  </Button>
                </form>

                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                    Already have a company account?{" "}
                    <Link
                      href="/login/company"
                      className="text-teal-600 hover:text-teal-700 font-semibold"
                    >
                      Sign in here
                    </Link>
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 text-xs text-gray-500">
                    <Link href="/login" className="hover:text-teal-600">
                      Job Seeker Login
                    </Link>
                    <span className="hidden sm:inline">•</span>
                    <Link href="/terms" className="hover:text-teal-600">
                      Terms & Conditions
                    </Link>
                    <span className="hidden sm:inline">•</span>
                    <Link href="/privacy" className="hover:text-teal-600">
                      Privacy Policy
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center space-x-6 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs">Secure Registration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Admin Verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span className="text-xs">Premium Support</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Your registration will be reviewed by our admin team within 24
                hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
