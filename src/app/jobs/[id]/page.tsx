"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Building,
  Users,
  Briefcase,
  CheckCircle,
  Star,
  Bookmark,
  ExternalLink,
  Award,
  Target,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import { Job } from "@/types";

export default function JobDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Add error boundary-like error handling
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setError("An unexpected error occurred. Please refresh the page.");
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      setError("An unexpected error occurred. Please refresh the page.");
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const resolvedParams = await params;
        const jobId = resolvedParams.id;

        if (!jobId) {
          throw new Error("Job ID is missing");
        }

        console.log("Fetching job with ID:", jobId);
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `HTTP Error: ${response.status} - ${errorData.error || "Unknown error"}`
          );
        }

        const data = await response.json();
        setJob(data);
      } catch (error) {
        console.error("Error fetching job details:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load job details."
        );
        toast.error("Failed to load job details. Redirecting to dashboard...");
        setTimeout(() => router.push("/dashboard"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params, router]);

  const handleApplyNow = () => {
    try {
      console.log("Apply button clicked!");
      console.log("Session:", session);
      console.log("Session status:", status);
      console.log("User role:", session?.user?.role);

      if (!session) {
        console.log("No session found, redirecting to login");
        toast.error("Please log in to apply for jobs");
        const callbackUrl = encodeURIComponent(pathname);
        router.push(`/api/auth/signin?callbackUrl=${callbackUrl}`);
        return;
      }

      if (session?.user?.role === "ADMIN") {
        console.log("User is admin, cannot apply");
        toast.error("Admins cannot apply for jobs");
        return;
      }

      if (!job) {
        console.error("Cannot apply: Job data is null");
        toast.error("Job data not available");
        return;
      }

      if (!job.id || !job.title) {
        console.error("Cannot apply: Missing job ID or title");
        toast.error("Job information is incomplete");
        return;
      }

      if (job.status !== "APPROVED") {
        console.log("Job not approved, status:", job.status);
        toast.error("This job is not available for applications");
        return;
      }

      console.log("All checks passed, redirecting to application form");
      const applicationUrl = `/application-form?jobId=${job.id}&title=${encodeURIComponent(job.title)}`;
      console.log("Application URL:", applicationUrl);
      router.push(applicationUrl);
    } catch (error) {
      console.error("Error in handleApplyNow:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleBookmarkToggle = async () => {
    if (!session || !job) {
      toast.error("Please sign in to bookmark jobs");
      return;
    }

    setBookmarkLoading(true);
    try {
      const response = await fetch("/api/bookmarks", {
        method: isBookmarked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
        toast.success(isBookmarked ? "Bookmark removed" : "Job bookmarked");
      } else {
        throw new Error("Failed to update bookmark");
      }
    } catch (error) {
      console.error("Bookmark error:", error);
      toast.error("Failed to update bookmark");
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) {
    return (
      <Loading variant="page" text="Loading job details" icon="briefcase" />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8 text-center border-0 shadow-lg">
          <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
            <ExternalLink className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Job
          </h3>
          <p className="text-red-600 mb-6">{error}</p>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8 text-center border-0 shadow-lg">
          <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
            <Briefcase className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Job Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The job you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Jobs
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back to Jobs</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmarkToggle}
                disabled={bookmarkLoading}
                className={`${isBookmarked ? "bg-yellow-50 border-yellow-200 text-yellow-700" : ""}`}
              >
                {bookmarkLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bookmark
                    className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-12 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Image
                        src={job.logo || "/logo.png"}
                        alt={`${job.company || "Company"} Logo`}
                        width={48}
                        height={48}
                        className="rounded-xl object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/logo.png";
                        }}
                      />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                        {job.title}
                      </h1>
                      <p className="text-xl text-blue-100">{job.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                      <Clock className="h-4 w-4" />
                      <span>
                        {job.site === "Full_time" ? "Full-time" : job.site}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {job.deadline}</span>
                    </div>
                  </div>

                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {job.area}
                  </Badge>
                </div>

                <div className="lg:text-right">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold w-full lg:w-auto"
                    onClick={handleApplyNow}
                    disabled={
                      job.status !== "APPROVED" ||
                      session?.user?.role === "ADMIN"
                    }
                  >
                    <Briefcase className="h-5 w-5 mr-2" />
                    Apply Now
                  </Button>
                  <p className="text-blue-100 text-sm mt-2">
                    {job.applications || 0} applications so far
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    About the Job
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {job.about_job}
                </p>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    Key Responsibilities
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {(job.responsibilities || []).map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Qualifications */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    Required Qualifications
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {(job.qualifications || []).map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Star className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Job Details Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Building className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    Job Details
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Company</span>
                  <span className="text-gray-900 font-semibold">
                    {job.company}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Location</span>
                  <span className="text-gray-900">{job.location}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Job Type</span>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {job.site === "Full_time" ? "Full-time" : job.site}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Posted</span>
                  <span className="text-gray-900">{job.postedDate}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Deadline</span>
                  <span className="text-red-600 font-medium">
                    {job.deadline}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 font-medium">
                    Applications
                  </span>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 font-semibold">
                      {job.applications || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Required Skills Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-100">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Zap className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    Required Skills
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  {(job.requiredSkills || []).map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-2 text-sm font-medium"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Apply Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Ready to Apply?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Join {job.applications || 0} other candidates who have
                    already applied for this position.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  onClick={handleApplyNow}
                  disabled={
                    job.status !== "APPROVED" || session?.user?.role === "ADMIN"
                  }
                >
                  <Briefcase className="h-5 w-5 mr-2" />
                  Apply for this Job
                </Button>
                {job.status !== "APPROVED" && (
                  <p className="text-amber-600 text-xs mt-2">
                    This job is currently under review
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
