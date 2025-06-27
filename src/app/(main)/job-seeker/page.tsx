"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loading } from "@/components/ui/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Bookmark,
  Clock,
  LucideIcon,
  X,
  Search,
  User,
  FileText,
  Calendar,
  MapPin,
  Building,
  Eye,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Profile } from "@/components/header";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Job {
  id: string;
  title: string;
  area: string;
  company_name: string;
  logo: string;
  about_job: string;
  location: string;
  deadline: string;
  site: string;
  qualifications: string[];
  responsibilities: string[];
  requiredSkills: string[];
}

interface AppliedJob {
  id: string;
  title: string;
  status: string;
  Company: string;
  appliedOn: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  description,
}: {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  trend?: string;
  description?: string;
}) => (
  <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
    <div
      className={`absolute top-0 right-0 w-24 h-24 ${color} rounded-full -translate-y-12 translate-x-12 opacity-10 group-hover:opacity-20 transition-opacity`}
    ></div>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center space-x-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <Badge
                variant="outline"
                className="text-xs bg-green-50 text-green-700 border-green-200"
              >
                {trend}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
        <div
          className={`p-4 rounded-2xl ${color} group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const TableSkeleton = () => {
  return (
    <div className="w-full border rounded-lg shadow-sm overflow-hidden">
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-200">
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-6 w-[100px]" />
        <Skeleton className="h-6 w-[150px]" />
      </div>
      <div className="divide-y divide-gray-300">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 p-4">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default function JobSeeker() {
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAppliedPage, setCurrentAppliedPage] = useState(1);
  const [currentBookmarkPage, setCurrentBookmarkPage] = useState(1);
  const itemsPerPage = 5;
  const { data: session, status } = useSession();

  // Calculate statistics
  const totalApplications = appliedJobs.length;
  const pendingApplications = appliedJobs.filter(
    (job) => job.status === "PENDING"
  ).length;

  const totalBookmarks = bookmarkedJobs.length;

  // Calculate pagination for applied jobs
  const appliedJobsLastPage = Math.ceil(appliedJobs.length / itemsPerPage);
  const appliedJobsStartIndex = (currentAppliedPage - 1) * itemsPerPage;
  const appliedJobsEndIndex = appliedJobsStartIndex + itemsPerPage;
  const currentAppliedJobs = appliedJobs.slice(
    appliedJobsStartIndex,
    appliedJobsEndIndex
  );

  // Calculate pagination for bookmarked jobs
  const bookmarkedJobsLastPage = Math.ceil(
    bookmarkedJobs.length / itemsPerPage
  );
  const bookmarkedJobsStartIndex = (currentBookmarkPage - 1) * itemsPerPage;
  const bookmarkedJobsEndIndex = bookmarkedJobsStartIndex + itemsPerPage;
  const currentBookmarkedJobs = bookmarkedJobs.slice(
    bookmarkedJobsStartIndex,
    bookmarkedJobsEndIndex
  );

  const handleRemoveBookmark = async (jobId: string) => {
    try {
      const response = await fetch(`/api/bookmarks`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });

      if (!response.ok) throw new Error("Failed to remove bookmark");

      setBookmarkedJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err) {
      console.error("Error removing bookmark:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch both applied jobs and bookmarks simultaneously
        const [appliedResponse, bookmarksResponse] = await Promise.all([
          fetch("/api/applications/user"),
          fetch("/api/bookmarks"),
        ]);

        if (!appliedResponse.ok)
          throw new Error("Failed to fetch applied jobs");
        if (!bookmarksResponse.ok)
          throw new Error("Failed to fetch bookmarked jobs");

        const [appliedData, bookmarksData] = await Promise.all([
          appliedResponse.json(),
          bookmarksResponse.json(),
        ]);

        setAppliedJobs(appliedData);
        setBookmarkedJobs(bookmarksData);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [session, status]);

  const renderPagination = (
    currentPage: number,
    lastPage: number,
    onPageChange: (page: number) => void
  ) => {
    if (lastPage <= 1) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(currentPage - 1)}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
          {[...Array(lastPage)].map((_, i) => (
            <PaginationItem key={i + 1}>
              <PaginationLink
                onClick={() => onPageChange(i + 1)}
                isActive={currentPage === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(currentPage + 1)}
              className={
                currentPage === lastPage
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (status === "loading" || loading)
    return (
      <Loading
        variant="page"
        text={
          status === "loading" ? "Authenticating..." : "Loading your dashboard"
        }
        icon="briefcase"
      />
    );
  if (!session) return <p>Please log in to view this page.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Job Seeker Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Profile email={session.user.email || ""} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
              <p className="text-blue-100 text-lg mb-6">
                Track your applications, discover new opportunities, and advance
                your career.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100">
                    <Search className="h-4 w-4 mr-2" />
                    Find Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Applications"
            value={totalApplications}
            icon={FileText}
            color="bg-blue-500"
            description="This month"
          />
          <StatCard
            title="Pending Reviews"
            value={pendingApplications}
            icon={Clock}
            color="bg-amber-500"
            description="Awaiting response"
          />

          <StatCard
            title="Saved Jobs"
            value={totalBookmarks}
            icon={Bookmark}
            color="bg-purple-500"
            description="Ready to apply"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Applied Jobs Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Recent Applications
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Track your job application status
                    </CardDescription>
                  </div>
                </div>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="text-sm border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Apply More
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <TableSkeleton />
              ) : error ? (
                <div className="text-center py-8">
                  <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              ) : appliedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No applications yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start your job search journey today!
                  </p>
                  <Link href="/dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Search className="h-4 w-4 mr-2" />
                      Browse Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentAppliedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {job.Company}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Applied {job.appliedOn}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              job.status === "ACCEPTED"
                                ? "default"
                                : job.status === "PENDING"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className={
                              job.status === "ACCEPTED"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : job.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  {renderPagination(
                    currentAppliedPage,
                    appliedJobsLastPage,
                    setCurrentAppliedPage
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bookmarked Jobs Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bookmark className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Saved Jobs
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Jobs you&apos;ve bookmarked for later
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200"
                >
                  {totalBookmarks} saved
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <TableSkeleton />
              ) : error ? (
                <div className="text-center py-8">
                  <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              ) : bookmarkedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                    <Bookmark className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No saved jobs yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Bookmark jobs you&apos;re interested in to apply later!
                  </p>
                  <Link href="/dashboard">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Search className="h-4 w-4 mr-2" />
                      Discover Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentBookmarkedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                            <Building className="h-4 w-4" />
                            <span>{job.company_name}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span>{job.location}</span>
                            <span>•</span>
                            <span>
                              {job.site === "Full_time"
                                ? "Full-time"
                                : job.site}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/jobs/${job.id}`}>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveBookmark(job.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {renderPagination(
                    currentBookmarkPage,
                    bookmarkedJobsLastPage,
                    setCurrentBookmarkPage
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-blue-50">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to take the next step?
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Enhance your profile, discover new opportunities, and connect
                  with top employers in your field.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Search className="h-4 w-4 mr-2" />
                      Browse All Jobs
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
