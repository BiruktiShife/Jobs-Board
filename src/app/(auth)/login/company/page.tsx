"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Lock,
  Building,
  Users,
  TrendingUp,
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
} from "lucide-react";

export default function CompanyLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        role: "COMPANY_ADMIN",
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials");
      } else {
        toast.success("Login successful");
        router.push("/dashboard/company");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <div className="flex min-h-screen">
        {/* Left Side - Company Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 relative overflow-hidden">
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
              <h1 className="text-4xl font-bold mb-4">
                Welcome Back, Employers!
              </h1>
              <p className="text-xl text-emerald-100 mb-8">
                Sign in to manage your job postings, review applications, and
                find the perfect candidates for your team.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    50,000+ Qualified Candidates
                  </h3>
                  <p className="text-emerald-100 text-sm">
                    Access to top talent pool
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Advanced Analytics</h3>
                  <p className="text-emerald-100 text-sm">
                    Track your hiring performance
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Smart Matching</h3>
                  <p className="text-emerald-100 text-sm">
                    AI-powered candidate recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  JobBoard
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Company Login
              </h1>
              <p className="text-gray-600">Access your employer dashboard</p>
            </div>

            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-2 pb-6">
                <div className="hidden lg:block text-center">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    Company Sign In
                  </CardTitle>
                  <p className="text-gray-600">
                    Welcome back! Access your employer dashboard.
                  </p>
                </div>
                <Badge className="mx-auto bg-emerald-100 text-emerald-700 border-emerald-200">
                  <Building className="h-3 w-3 mr-1" />
                  Employer Portal
                </Badge>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
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
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
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

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="h-5 w-5 mr-2" />
                    )}
                    {loading ? "Signing In..." : "Access Dashboard"}
                  </Button>
                </form>

                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                    Don't have a company account?{" "}
                    <Link
                      href="/register/company"
                      className="text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      Register your company
                    </Link>
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 text-xs text-gray-500">
                    <Link href="/login" className="hover:text-emerald-600">
                      Job Seeker Login
                    </Link>
                    <span className="hidden sm:inline">•</span>
                    <Link
                      href="/forgot-password"
                      className="hover:text-emerald-600"
                    >
                      Forgot Password?
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
                  <span className="text-xs">Enterprise Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Trusted by 5K+ Companies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
