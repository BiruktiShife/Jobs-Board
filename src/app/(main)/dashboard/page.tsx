"use client";

import Image from "next/image";
import { HomeSection } from "@/components/home-section";
import JobCard from "@/utils/jobCard";
import { Profile } from "@/components/header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
      !["ADMIN", "JOB_SEEKER"].includes(session.user?.role)
    ) {
      router.push("/unauthorized");
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        if (!response.ok) throw new Error("Failed to fetch jobs");
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    if (
      status === "authenticated" &&
      ["ADMIN", "JOB_SEEKER"].includes(session?.user?.role)
    ) {
      fetchJobs();
    }
  }, [status, session]);

  if (status === "loading") return <p>Loading session...</p>;
  if (loading) return <p>Loading job details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="flex items-center justify-between bg-gray-800 shadow-md py-4">
        <div className="flex items-center gap-0 px-8">
          <Image
            src="/logo.png"
            alt="logo"
            width={100}
            height={20}
            className="flex-shrink-0"
          />
          <span className="text-2xl font-bold text-green-600">JobBoard</span>
        </div>
        <div className="flex space-x-4 mr-4 gap-4">
          {session?.user?.role !== "ADMIN" ? (
            <Link
              href="/job-seeker"
              className="text-green-500 hover:text-green-400 font-bold"
            >
              Home
            </Link>
          ) : (
            <Link
              href="/dashboard/admin"
              className="text-green-500 hover:text-green-400 font-bold"
            >
              Home
            </Link>
          )}
          <Profile email="guest@example.com" />
        </div>
      </nav>
      <div className="flex flex-col md:flex-row md:space-x-8 p-8">
        <div className="w-full md:w-2/3">
          <HomeSection />
        </div>
        <aside className="border-l border-gray-300 pl-6">
          <h2 className="text-2xl font-bold mb-4">Recommended Jobs</h2>
          <div>
            {jobs.map((job) => (
              <JobCard key={job.id} jobData={job} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
