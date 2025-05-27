"use client";

import Image from "next/image";
import { HomeSection } from "@/components/home-section";
import JobCard from "@/utils/jobCard";
import { Profile } from "@/components/header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  postedDate: string; // Added for sorting
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      status === "authenticated" &&
      !["ADMIN", "JOB_SEEKER"].includes(session.user?.role || "")
    ) {
      router.push("/unauthorized");
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs/recommended-jobs");
        if (!response.ok) throw new Error("Failed to fetch recommended jobs");
        const data = await response.json();
        // Sort recommended jobs by postedDate (latest first)
        const sortedData = data.sort(
          (a: Job, b: Job) =>
            new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );
        setJobs(sortedData);
      } catch (err) {
        console.error(err);
        setError("Failed to load recommended jobs");
      } finally {
        setLoading(false);
      }
    };

    if (
      status === "authenticated" &&
      session?.user?.role === "JOB_SEEKER" // Only fetch for JOB_SEEKER
    ) {
      fetchJobs();
    } else {
      setLoading(false); // Skip loading for ADMIN
    }
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-green-100 p-3 sm:p-8">
        <Loader2 className="w-6 h-6 sm:w-10 sm:h-10 animate-spin text-green-600" />
      </div>
    );
  }

  if (!session || !session.user.email) {
    return null;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-3 sm:p-8">
        <p className="text-red-500 text-xs sm:text-base">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-10 sm:pt-12 overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-transparent backdrop-blur-md shadow-md py-2 sm:py-1.5">
        <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-8">
          <Image
            src="/logo.png"
            alt="logo"
            width={80}
            height={16}
            className="w-14 sm:w-20"
          />
          <span className="text-lg sm:text-2xl font-bold text-green-600">
            JobBoard
          </span>
        </div>
        <div className="flex space-x-1 sm:space-x-4 mr-3 gap-1 sm:gap-4">
          {session?.user?.role !== "ADMIN" ? (
            <Link
              href="/job-seeker"
              className="text-green-500 hover:text-green-400 font-bold text-xs sm:text-base mt-3"
            >
              Home
            </Link>
          ) : (
            <Link
              href="/admin"
              className="text-green-500 hover:text-green-400 font-bold text-xs sm:text-base mt-3"
            >
              Home
            </Link>
          )}
          <Profile email={session.user.email} />
        </div>
      </nav>
      {jobs.length < 3 || session.user.role === "ADMIN" ? (
        <div className="w-full p-3 sm:p-8">
          <HomeSection
            recommendedJobs={session.user.role === "ADMIN" ? [] : jobs}
            userRole={session.user.role}
          />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 p-3 sm:p-8">
          <aside className="w-full md:w-1/3 md:border-l md:pl-6 order-1 md:order-2 hidden md:block">
            <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
              Recommended Jobs
            </h2>
            <div className="space-y-2 sm:space-y-4">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <JobCard key={job.id} jobData={job} className="w-full" />
                ))
              ) : (
                <p className="text-gray-600 text-xs sm:text-base">
                  No recommended jobs match your study area yet.
                </p>
              )}
            </div>
          </aside>
          <div className="w-full md:w-2/3 space-y-3 sm:space-y-6 order-2 md:order-1">
            <HomeSection recommendedJobs={jobs} userRole={session.user.role} />
          </div>
        </div>
      )}
    </div>
  );
}
