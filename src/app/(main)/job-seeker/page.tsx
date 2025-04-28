"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { CustomTable } from "@/components/table";
import JobCard from "@/utils/jobCard";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

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

const JobCardSkeleton = () => {
  return (
    <div className="p-6 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-[250px] mt-4" />
      <Skeleton className="h-4 w-[200px] mt-2" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-10 w-[100px] mt-4" />
    </div>
  );
};

const TableSkeleton = () => {
  return (
    <div className="w-full border rounded-lg overflow-hidden">
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50">
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-6 w-[100px]" />
        <Skeleton className="h-6 w-[150px]" />
      </div>
      <div className="divide-y divide-gray-200">
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
  const [activeTab, setActiveTab] = useState<"Applied jobs" | "bookmarks">(
    "Applied jobs"
  );
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (activeTab === "Applied jobs" && session?.user.id) {
          const response = await fetch("/api/applications/user");
          if (!response.ok) throw new Error("Failed to fetch applied jobs");
          const data = await response.json();
          setAppliedJobs(data);
        } else if (activeTab === "bookmarks" && session?.user.id) {
          const response = await fetch("/api/bookmarks");
          if (!response.ok) throw new Error("Failed to fetch bookmarked jobs");
          const data = await response.json();
          setBookmarkedJobs(data);
        }
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
  }, [activeTab, session, status]);

  if (status === "loading")
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-green-100">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  if (!session) return <p>Please log in to view this page.</p>;

  return (
    <div className="flex min-h-screen">
      <Sidebar<"Applied jobs" | "bookmarks">
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role="candidate"
      />
      <main className="flex-1 p-8 bg-gray-100">
        <span className="flex justify-between">
          <Header activeTab={activeTab} email={""} />
        </span>

        {activeTab === "Applied jobs" && (
          <div>
            {loading && <TableSkeleton />}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
              <CustomTable
                data={appliedJobs.map((job) => ({
                  title: job.title,
                  company: job.Company,
                  status: job.status,
                  appliedOn: job.appliedOn,
                }))}
                columns={["Title", "Company", "Status", "Applied On"]}
              />
            )}
          </div>
        )}
        {activeTab === "bookmarks" && (
          <div>
            {loading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, index) => (
                  <JobCardSkeleton key={index} />
                ))}
              </div>
            )}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {bookmarkedJobs.length > 0 ? (
                  bookmarkedJobs.map((job) => (
                    <JobCard key={job.id} jobData={job} />
                  ))
                ) : (
                  <p>No bookmarked jobs found.</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
