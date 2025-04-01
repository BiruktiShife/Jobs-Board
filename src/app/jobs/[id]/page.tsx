"use client";

import { useState, useEffect } from "react";
import { BsArrowLeft } from "react-icons/bs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MdBusiness } from "react-icons/md";
import { AiOutlineCalendar } from "react-icons/ai";
import { FaMapMarkerAlt } from "react-icons/fa";
import Image from "next/image";

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!job) {
    return <div>No job found</div>;
  }

  const handleApplyNow = () => {
    router.push(
      `/application-form?jobId=${job.id}&title=${encodeURIComponent(job.title)}`
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-green-300">
      <div className="flex items-center mb-6">
        <Link
          href="/dashboard"
          className="mr-4 text-lg bg-green-700 hover:bg-green-800 flex items-center rounded-md px-4 py-2 text-white"
        >
          <BsArrowLeft className="mr-2 text-white" /> Back to Jobs
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">{job.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 overflow-hidden">
                <Image
                  src={job.logo}
                  alt={`${job.company} Logo`}
                  width={200}
                  height={200}
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  {job.company}
                </span>
                <div className="text-sm text-gray-500">{job.area}</div>
              </div>
            </div>

            <Button
              className="bg-green-600 text-white hover:bg-green-700 mt-4 px-10"
              onClick={handleApplyNow}
            >
              Apply Now
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col space-y-2 mb-4 ml-5">
            <div className="flex items-center space-x-2">
              <FaMapMarkerAlt className="text-purple-600 w-7 h-7" />
              <span className="text-xl">{job.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <AiOutlineCalendar className="text-purple-600 w-7 h-7" />
              <span className="text-xl">{job.deadline}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MdBusiness className="text-purple-600 w-7 h-7" />
              <span className="text-xl">{job.site}</span>
            </div>
          </div>

          <Card className="mb-3">
            <CardHeader>
              <CardTitle>About the Job</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{job.about_job}</p>
            </CardContent>
          </Card>

          <Card className="mb-3">
            <CardHeader>
              <CardTitle>Minimum Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 text-gray-700">
                {job.qualifications.map((item, index) => (
                  <li key={index} className="mb-2">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-3">
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-3">
            <CardHeader>
              <CardTitle>Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 text-gray-700">
                {job.responsibilities.map((item, index) => (
                  <li key={index} className="mb-2">
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
