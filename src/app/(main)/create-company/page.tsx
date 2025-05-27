"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BsArrowLeft } from "react-icons/bs";
import {
  Building2,
  Image as ImageIcon,
  Info,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  UserCog,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateCompanyPage() {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [, setLogo] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [about, setAbout] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/login");
    }
  }, [session, status, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogo(`/${file.name}`);

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("name", name);
    if (logoFile) formData.append("logo", logoFile);
    formData.append("about", about);
    formData.append("email", email);
    formData.append("password", password);

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        setName("");
        setLogoFile(null);
        setLogo("");
        setLogoPreview(null);
        setAbout("");
        setEmail("");
        setPassword("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create company");
      }
    } catch (error) {
      console.error("Create company error:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex items-center space-x-4">
          <UserCog className="w-8 h-8 animate-spin text-green-600" />
          <span className="text-gray-600 font-medium">
            Loading admin session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="shadow-2xl rounded-2xl overflow-hidden border border-gray-200 bg-white">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 sm:p-8">
            <div className="flex items-center justify-between">
              <Link
                href="/admin"
                className="text-white hover:text-blue-200 transition-colors duration-200"
              >
                <BsArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <div className="flex flex-col items-center text-center">
                <CardTitle className="text-xl sm:text-2xl font-semibold flex items-center justify-center gap-1 sm:gap-2">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  Create New Company
                </CardTitle>
                <p className="text-blue-100 text-xs sm:text-sm mt-1 sm:mt-2 font-light">
                  Set up a new company profile
                </p>
              </div>
              <div className="sm:w-6" />
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200"
                >
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200"
                >
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">{success}</p>
                </motion.div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700 font-medium">
                    <Building2 className="w-4 h-4 text-green-600" />
                    Company Name
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. Tech Solutions Inc."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-lg transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700 font-medium">
                    <ImageIcon className="w-4 h-4 text-green-600" />
                    Company Logo
                  </Label>
                  <div className="flex items-center gap-4">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 p-6 w-full">
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 font-medium">
                          {logoFile ? logoFile.name : "Click to upload logo"}
                        </p>
                      </div>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {logoPreview && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <Image
                          src={logoPreview}
                          alt="Logo Preview"
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700 font-medium">
                    <Info className="w-4 h-4 text-green-600" />
                    About the Company
                  </Label>
                  <Textarea
                    placeholder="Brief description of your company..."
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="min-h-[120px] border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-lg transition-all duration-200"
                  />
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-800 mb-6">
                    <UserCog className="w-5 h-5 text-green-600" />
                    Account Details
                  </h3>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-gray-700 font-medium">
                        <Mail className="w-4 h-4 text-green-600" />
                        Email
                      </Label>
                      <Input
                        type="email"
                        placeholder="admin@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-lg transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-gray-700 font-medium">
                        <Lock className="w-4 h-4 text-green-600" />
                        Password
                      </Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-lg transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-all shadow-md",
                  "flex items-center justify-center gap-2",
                  isSubmitting && "opacity-80 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Company...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Create Company</span>
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
