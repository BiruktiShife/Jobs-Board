"use client";

import Image from "next/image";
import JobCard from "@/utils/jobCard";
import { Profile } from "@/components/header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { HomeSection } from "@/components/home-section";

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
  postedDate: string;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  paginate,
}: {
  currentPage: number;
  totalPages: number;
  paginate: (page: number) => void;
}) => (
  <div className="flex justify-center items-center space-x-2 mt-4">
    <button
      onClick={() => paginate(currentPage - 1)}
      disabled={currentPage === 1}
      className={`px-3 py-1 rounded ${
        currentPage === 1
          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
          : "bg-green-500 text-white hover:bg-green-600"
      }`}
    >
      Previous
    </button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
      <button
        key={number}
        onClick={() => paginate(number)}
        className={`px-3 py-1 rounded ${
          currentPage === number
            ? "bg-green-600 text-white"
            : "bg-gray-200 hover:bg-green-100"
        }`}
      >
        {number}
      </button>
    ))}
    <button
      onClick={() => paginate(currentPage + 1)}
      disabled={currentPage === totalPages}
      className={`px-3 py-1 rounded ${
        currentPage === totalPages
          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
          : "bg-green-500 text-white hover:bg-green-600"
      }`}
    >
      Next
    </button>
  </div>
);

export default function Dashboard() {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recommendedPage, setRecommendedPage] = useState(1);
  const jobsPerPage = 6;
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
        setLoading(true);

        // Fetch all jobs
        const allJobsResponse = await fetch("/api/jobs");
        if (!allJobsResponse.ok) throw new Error("Failed to fetch all jobs");
        const allJobsData = await allJobsResponse.json();
        setAllJobs(allJobsData);

        // Fetch recommended jobs if user is JOB_SEEKER
        if (session?.user?.role === "JOB_SEEKER") {
          const recommendedResponse = await fetch("/api/jobs/recommended-jobs");
          if (!recommendedResponse.ok)
            throw new Error("Failed to fetch recommended jobs");
          const recommendedData = await recommendedResponse.json();
          setRecommendedJobs(recommendedData);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(err instanceof Error ? err.message : "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchJobs();
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

  // Calculate pagination for main jobs section
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = allJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(allJobs.length / jobsPerPage);

  // Calculate pagination for recommended section
  const indexOfLastRecommended = recommendedPage * jobsPerPage;
  const indexOfFirstRecommended = indexOfLastRecommended - jobsPerPage;
  const currentRecommendedJobs = recommendedJobs.slice(
    indexOfFirstRecommended,
    indexOfLastRecommended
  );
  const totalRecommendedPages = Math.ceil(recommendedJobs.length / jobsPerPage);

  const showSplitLayout =
    recommendedJobs.length > 3 && session.user.role === "JOB_SEEKER";

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
      <div className="p-3 sm:p-8">
        {!showSplitLayout ? (
          <div className="space-y-4">
            <HomeSection
              recommendedJobs={[]}
              userRole={session.user.role}
              hideJobsSection={true}
            />
            <div className="container mx-auto px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8">
                Available Jobs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentJobs.map((job) => (
                  <JobCard key={job.id} jobData={job} className="w-full" />
                ))}
              </div>
              {allJobs.length > 0 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  paginate={setCurrentPage}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <HomeSection
              recommendedJobs={[]}
              userRole={session.user.role}
              hideJobsSection={true}
            />
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              <div className="w-full md:w-2/3 space-y-3 sm:space-y-6 order-2 md:order-1">
                <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                  All Jobs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentJobs.map((job) => (
                    <JobCard key={job.id} jobData={job} className="w-full" />
                  ))}
                </div>
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  paginate={setCurrentPage}
                />
              </div>
              <aside className="w-full md:w-1/3 md:border-l md:pl-6 order-1 md:order-2">
                <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                  Recommended Jobs
                </h2>
                <div className="space-y-2 sm:space-y-4">
                  {recommendedJobs.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 gap-4">
                        {currentRecommendedJobs.map((job) => (
                          <JobCard
                            key={job.id}
                            jobData={job}
                            className="w-full"
                          />
                        ))}
                      </div>
                      <PaginationControls
                        currentPage={recommendedPage}
                        totalPages={totalRecommendedPages}
                        paginate={setRecommendedPage}
                      />
                    </>
                  ) : (
                    <p className="text-gray-600 text-xs sm:text-base">
                      No recommended jobs match your study area yet.
                    </p>
                  )}
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
