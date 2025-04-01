"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { CustomTable } from "@/components/table";
import JobCard from "@/utils/jobCard";
import { useSession } from "next-auth/react";

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
  company: string;
}

export default function JobSeeker() {
  const [activeTab, setActiveTab] = useState<"jobs" | "bookmarks">("jobs");
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
        if (activeTab === "jobs" && session?.user.id) {
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

  if (status === "loading") return <p>Loading session...</p>;
  if (!session) return <p>Please log in to view this page.</p>;

  return (
    <div className="flex min-h-screen">
      <Sidebar<"jobs" | "bookmarks">
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role="candidate"
      />
      <main className="flex-1 p-8 bg-gray-100">
        <Header
          activeTab={activeTab}
          email={session.user.email || "candidate@example.com"}
        />

        {activeTab === "jobs" && (
          <div>
            {loading && <p>Loading applied jobs...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
              <CustomTable
                data={appliedJobs}
                columns={["Title", "Status", "Company"]}
              />
            )}
          </div>
        )}
        {activeTab === "bookmarks" && (
          <div>
            {loading && <p>Loading jobs...</p>}
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
