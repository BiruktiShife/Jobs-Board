"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { FaMapMarkerAlt } from "react-icons/fa";
import { AiOutlineCalendar } from "react-icons/ai";
import { MdBusiness } from "react-icons/md";
import { FiBookmark } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Job {
  id: string;
  title: string;
  area: string;
  company_name: string;
  logo: string;
  location: string;
  deadline: string;
  site: string;
  about_job: string;
  qualifications: string[];
  responsibilities: string[];
  requiredSkills: string[];
}

interface JobCardProps {
  jobData?: Job;
  className?: string;
}

export default function JobCard({ jobData, className }: JobCardProps) {
  const [job, setJob] = useState<Job | null>(jobData || null);
  const [loading, setLoading] = useState(!jobData);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (!job) {
      const fetchJob = async () => {
        try {
          const response = await fetch("/api/jobs");
          if (!response.ok) throw new Error("Failed to fetch jobs");
          const data = await response.json();
          setJob(data[0]);
          setLoading(false);
        } catch (err) {
          console.error(err);
          setError("Failed to load job details");
          setLoading(false);
        }
      };
      fetchJob();
    }
  }, [job]);

  useEffect(() => {
    if (session?.user.id && job?.id) {
      const fetchBookmarkStatus = async () => {
        try {
          const response = await fetch("/api/bookmarks");
          if (response.ok) {
            const bookmarkedJobs = await response.json();
            const isCurrentlyBookmarked = bookmarkedJobs.some(
              (j: Job) => j.id === job.id
            );
            setIsBookmarked(isCurrentlyBookmarked);
            console.log(`Job ${job.id} bookmarked: ${isCurrentlyBookmarked}`);
          }
        } catch (err) {
          console.error("Error fetching bookmarks:", err);
        }
      };
      fetchBookmarkStatus();
    }
  }, [session, job]);

  const handleBookmarkToggle = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job!.id }),
      });

      if (response.ok) {
        const { bookmarked } = await response.json();
        setIsBookmarked(bookmarked);
        console.log(`Bookmark toggled for job ${job!.id}: ${bookmarked}`);
      } else {
        console.error("Failed to toggle bookmark:", response.statusText);
      }
    } catch (err) {
      console.error("Bookmark toggle error:", err);
    }
  };

  if (loading)
    return <p className="text-xs sm:text-base">Loading job details...</p>;
  if (error)
    return <p className="text-red-500 text-xs sm:text-base">{error}</p>;
  if (!job) return null;

  return (
    <Card className={`p-3 sm:p-4 text-xs sm:text-base ${className}`}>
      <CardHeader className="p-1 sm:p-2">
        <CardTitle className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 sm:w-16 h-12 sm:h-16 overflow-hidden rounded-full">
            <Image
              src={job.logo || "/logo.png"}
              alt={`${job.company_name} Logo`}
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <span className="text-lg sm:text-2xl font-bold text-gray-900">
              {job.company_name}
            </span>
            <div className="text-xs sm:text-sm text-gray-500">{job.area}</div>
          </div>
          <button onClick={handleBookmarkToggle} className="focus:outline-none">
            <FiBookmark
              className={`w-5 sm:w-6 h-5 sm:h-6 ${
                isBookmarked
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-500"
              }`}
            />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-1 sm:p-2">
        <div className="flex flex-col space-y-1 sm:space-y-2 mb-3 sm:mb-4">
          <h1 className="font-bold text-lg sm:text-2xl">{job.title}</h1>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <FaMapMarkerAlt className="text-purple-600 w-4 sm:w-5 h-4 sm:h-5" />
            <span className="text-xs sm:text-base">{job.location}</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <AiOutlineCalendar className="text-purple-600 w-4 sm:w-5 h-4 sm:h-5" />
            <span className="text-xs sm:text-base">{job.deadline}</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <MdBusiness className="text-purple-600 w-4 sm:w-5 h-4 sm:h-5" />
            <span className="text-xs sm:text-base">
              {job.site === "Full_time" ? "Full-time" : job.site}
            </span>
          </div>
        </div>
        <Card className="p-2 sm:p-4">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              About the Job
            </CardTitle>
          </CardHeader>
          <CardContent className="p-1 sm:p-2">
            <p className="text-xs sm:text-base text-gray-700">
              {expanded || job.about_job.length <= 200
                ? job.about_job
                : job.about_job.slice(0, 80) + "..."}
            </p>
            {job.about_job.length > 200 && (
              <button
                className="text-green-700 text-xs sm:text-base mt-1 sm:mt-2 hover:text-green-500"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "read less" : "read more"}
              </button>
            )}
          </CardContent>
        </Card>
        <Button
          className="bg-green-600 text-white hover:bg-green-700 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-base mt-3 sm:mt-4 w-full sm:w-auto"
          onClick={() => router.push(`/jobs/${job.id}`)}
        >
          View Job Detail
        </Button>
      </CardContent>
    </Card>
  );
}
