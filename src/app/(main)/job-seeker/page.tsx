"use client";

import { useEffect, useState } from "react";
import { CustomTable, TableData, ColumnName } from "@/components/table";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Briefcase,
  Bookmark,
  Clock,
  CheckCircle,
  LucideIcon,
  X,
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

interface BookmarkTableData {
  id: string;
  title: string;
  company_name: string;
}

const isBookmarkTableData = (row: TableData): row is BookmarkTableData => {
  return "id" in row && "title" in row && "company_name" in row;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}) => (
  <div className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
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
  const acceptedApplications = appliedJobs.filter(
    (job) => job.status === "ACCEPTED"
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

  if (status === "loading")
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-green-100">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  if (!session) return <p>Please log in to view this page.</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Job Seeker Dashboard
          </h1>
          <Profile email={session.user.email || ""} />
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <StatCard
            title="Total Applications"
            value={totalApplications}
            icon={Briefcase}
            color="bg-blue-500"
          />
          <StatCard
            title="Pending Applications"
            value={pendingApplications}
            icon={Clock}
            color="bg-yellow-500"
          />
          <StatCard
            title="Accepted Applications"
            value={acceptedApplications}
            icon={CheckCircle}
            color="bg-green-500"
          />
          <StatCard
            title="Bookmarked Jobs"
            value={totalBookmarks}
            icon={Bookmark}
            color="bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Applied Jobs Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Applied Jobs
              </h2>
              <Link href="/dashboard">
                <Button variant="outline" className="text-sm">
                  View All Jobs
                </Button>
              </Link>
            </div>
            {loading ? (
              <TableSkeleton />
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : appliedJobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No applications yet</p>
                <Link href="/dashboard">
                  <Button className="mt-4 bg-green-600 text-white hover:bg-green-700">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <CustomTable
                    data={currentAppliedJobs.map((job) => ({
                      id: job.id,
                      title: job.title,
                      company: job.Company,
                      status: job.status,
                      appliedOn: job.appliedOn,
                    }))}
                    columns={["Title", "Company", "Status", "Applied On"]}
                  />
                </div>
                {renderPagination(
                  currentAppliedPage,
                  appliedJobsLastPage,
                  setCurrentAppliedPage
                )}
              </>
            )}
          </div>

          {/* Bookmarked Jobs Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Bookmarked Jobs
              </h2>
            </div>
            {loading ? (
              <TableSkeleton />
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : bookmarkedJobs.length === 0 ? (
              <div className="text-center py-8">
                <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No bookmarked jobs</p>
                <Link href="/dashboard">
                  <Button className="mt-4 bg-green-600 text-white hover:bg-green-700">
                    Discover Jobs
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <CustomTable
                    data={currentBookmarkedJobs.map((job) => ({
                      id: job.id,
                      title: job.title,
                      company_name: job.company_name,
                    }))}
                    columns={["Job Title", "Company Name", "Actions"]}
                    renderCell={(row: TableData, column: ColumnName) => {
                      if (!isBookmarkTableData(row)) {
                        return <span className="text-gray-500">N/A</span>;
                      }
                      switch (column) {
                        case "Job Title":
                          return <span>{row.title || "N/A"}</span>;
                        case "Company Name":
                          return <span>{row.company_name || "N/A"}</span>;
                        case "Actions":
                          return (
                            <div className="flex space-x-2">
                              <Link href={`/jobs/${row.id}`}>
                                <Button className="bg-green-600 text-white hover:bg-green-700 px-3 py-1 rounded-md text-sm">
                                  View
                                </Button>
                              </Link>
                              <Button
                                onClick={() => handleRemoveBookmark(row.id)}
                                className="bg-red-100 text-red-600 hover:bg-red-200 px-2 py-1 rounded-md"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        default:
                          return <span className="text-gray-500">N/A</span>;
                      }
                    }}
                  />
                </div>
                {renderPagination(
                  currentBookmarkPage,
                  bookmarkedJobsLastPage,
                  setCurrentBookmarkPage
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
