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
    <Card
      className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden ${className}`}
    >
      <CardContent className="p-6">
        {/* Header with Company Info and Bookmark */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 overflow-hidden rounded-xl bg-gray-100 flex-shrink-0">
              <Image
                src={job.logo || "/logo.png"}
                alt={`${job.company_name} Logo`}
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 truncate">
                {job.title}
              </h3>
              <p className="text-gray-600 font-medium">{job.company_name}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {job.area}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleBookmarkToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FiBookmark
              className={`w-5 h-5 ${
                isBookmarked
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            />
          </button>
        </div>

        {/* Job Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FaMapMarkerAlt className="text-blue-500 w-4 h-4 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <AiOutlineCalendar className="text-green-500 w-4 h-4 flex-shrink-0" />
            <span>Deadline: {job.deadline}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MdBusiness className="text-purple-500 w-4 h-4 flex-shrink-0" />
            <span>{job.site === "Full_time" ? "Full-time" : job.site}</span>
          </div>
        </div>

        {/* Job Description */}
        <div className="mb-6">
          <p className="text-gray-700 text-sm leading-relaxed">
            {expanded || job.about_job.length <= 120
              ? job.about_job
              : job.about_job.slice(0, 120) + "..."}
          </p>
          {job.about_job.length > 120 && (
            <button
              className="text-blue-600 text-sm mt-2 hover:text-blue-700 font-medium"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        {/* Skills Preview */}
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {skill}
                </span>
              ))}
              {job.requiredSkills.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                  +{job.requiredSkills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 group-hover:bg-blue-700 transition-colors"
          onClick={() => router.push(`/jobs/${job.id}`)}
        >
          View Details & Apply
        </Button>
      </CardContent>
    </Card>
  );
}
