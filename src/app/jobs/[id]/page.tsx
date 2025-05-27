"use client";

import { useState, useEffect } from "react";
import { BsArrowLeft } from "react-icons/bs";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MdBusiness } from "react-icons/md";
import { AiOutlineCalendar } from "react-icons/ai";
import { FaMapMarkerAlt } from "react-icons/fa";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

interface Job {
  id: string;
  title: string;
  logo: string;
  company: string;
  area: string;
  location: string;
  deadline: string;
  site: string;
  qualifications: string[];
  responsibilities: string[];
  about_job: string;
  requiredSkills: string[];
}

export default function JobDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isDisabled] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const resolvedParams = await params;
        const jobId = resolvedParams.id;

        if (!jobId) return;

        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const mappedSite =
          data.site === "Full_time"
            ? "Full-time"
            : data.site === "Part_time"
            ? "Part-time"
            : data.site;

        setJob({
          ...data,
          site: mappedSite,
        });
      } catch (error) {
        console.error("Error fetching job details:", error);
        setError("Failed to load job details. Please try again.");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params, router]);

  const handleApplyNow = () => {
    if (!session) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/api/auth/signin?callbackUrl=${callbackUrl}`);
      return;
    }
    router.push(
      `/application-form?jobId=${job.id}&title=${encodeURIComponent(job.title)}`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 sm:w-8 h-6 sm:h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm sm:text-base text-center py-6">
        {error}
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-gray-600 text-sm sm:text-base text-center py-6">
        No job found
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 bg-gradient-to-br from-gray-50 to-green-200 sm:to-green-300 overflow-x-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 mb-4 sm:mb-6">
        <Link
          href="/dashboard"
          className="flex items-center bg-green-700 hover:bg-green-800 rounded-md px-3 sm:px-4 py-1.5 sm:py-2 text-white text-sm sm:text-base w-full sm:w-auto"
        >
          <BsArrowLeft className="mr-2 text-white w-4 sm:w-5 h-4 sm:h-5" /> Back
          to Jobs
        </Link>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center sm:text-left">
          {job.title}
        </h1>
      </div>

      <Card className="w-full shadow-sm sm:shadow-md p-3 sm:p-4">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 sm:w-16 h-12 sm:h-16 overflow-hidden rounded-full">
                <Image
                  src={job.logo}
                  alt={`${job.company} Logo`}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-lg sm:text-2xl font-bold text-gray-900">
                  {job.company}
                </span>
                <div className="text-xs sm:text-sm text-gray-500">
                  {job.area}
                </div>
              </div>
            </div>
            {session?.user?.role === "ADMIN" ? (
              <Button
                className="bg-green-600 text-white hover:bg-green-700 px-3 sm:px-10 py-1.5 sm:py-2 text-sm sm:text-base w-full sm:w-auto mt-3 sm:mt-0"
                disabled={isDisabled}
              >
                Apply Now
              </Button>
            ) : (
              <Button
                className="bg-green-600 text-white hover:bg-green-700 px-3 sm:px-10 py-1.5 sm:py-2 text-sm sm:text-base w-full sm:w-auto mt-3 sm:mt-0"
                onClick={handleApplyNow}
              >
                Apply Now
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col space-y-1 sm:space-y-3 mb-3 sm:mb-4">
            <div className="flex items-center space-x-2">
              <FaMapMarkerAlt className="text-purple-600 w-5 sm:w-7 h-5 sm:h-7" />
              <span className="text-base sm:text-xl text-gray-800">
                {job.location}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AiOutlineCalendar className="text-purple-600 w-5 sm:w-7 h-5 sm:h-7" />
              <span className="text-base sm:text-xl text-gray-800">
                {job.deadline}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MdBusiness className="text-purple-600 w-5 sm:w-7 h-5 sm:h-7" />
              <span className="text-base sm:text-xl text-gray-800">
                {job.site}
              </span>
            </div>
          </div>

          <Card className="mb-3 sm:mb-4 p-2 sm:p-4 shadow-sm sm:shadow-md">
            <CardHeader className="p-2 sm:p-4">
              <CardTitle className="text-base sm:text-lg">
                About the Job
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <p className="text-sm sm:text-base text-gray-800">
                {job.about_job}
              </p>
            </CardContent>
          </Card>

          <Card className="mb-3 sm:mb-4 p-2 sm:p-4 shadow-sm sm:shadow-md">
            <CardHeader className="p-2 sm:p-4">
              <CardTitle className="text-base sm:text-lg">
                Minimum Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <ul className="list-disc pl-4 sm:pl-6 text-gray-800 text-sm sm:text-base">
                {job.qualifications.map((item, index) => (
                  <li key={index} className="mb-1 sm:mb-2">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-3 sm:mb-4 p-2 sm:p-4 shadow-sm sm:shadow-md">
            <CardHeader className="p-2 sm:p-4">
              <CardTitle className="text-base sm:text-lg">
                Required Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {job.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-3 sm:mb-4 p-2 sm:p-4 shadow-sm sm:shadow-md">
            <CardHeader className="p-2 sm:p-4">
              <CardTitle className="text-base sm:text-lg">
                Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <ul className="list-disc pl-4 sm:pl-6 text-gray-800 text-sm sm:text-base">
                {job.responsibilities.map((item, index) => (
                  <li key={index} className="mb-1 sm:mb-2">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
