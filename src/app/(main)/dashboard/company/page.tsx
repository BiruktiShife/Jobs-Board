"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Profile } from "@/components/header";

interface Job {
  id: string;
  title: string;
  area: string;
  location: string;
  deadline: string;
  applications: Application[];
}

interface Application {
  id: string;
  fullName: string;
  email: string;
  careerLevel: string;
  skills: string[];
  degreeType: string;
  certifications: string[];
  languages: string[];
  createdAt: string;
}

export default function CompanyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companyName, setCompanyName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "COMPANY_ADMIN") {
      router.push("/login");
      return;
    }

    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/company-jobs");
        if (!response.ok) {
          throw new Error(`Failed to fetch jobs: ${response.statusText}`);
        }
        const data = await response.json();
        setCompanyName(data.companyName || "Unknown Company");
        const validJobs = Array.isArray(data.jobs)
          ? data.jobs.map((job: Job) => ({
              ...job,
              applications: job.applications || [],
            }))
          : [];
        setJobs(validJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Failed to load jobs for your company");
        setJobs([]);
        setCompanyName("Unknown Company");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [session, status, router]);

  const handleViewApplicants = (jobId: string) => {
    router.push(`/applicants-detail/${jobId}`);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-300 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-green-700">
            {companyName} Dashboard
          </h1>
          <div className="flex space-x-4 px-8">
            <Button
              variant="outline"
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => router.push("/jobs/company-job-form")}
            >
              Post New Job
            </Button>
            <Profile email="candidate@example.com" />
          </div>
        </header>

        <Tabs defaultValue="jobs" className="space-y-6">
          <h1 className="font-extrabold text-2xl text-green-700">
            Posted Jobs
          </h1>

          <TabsContent value="jobs">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-green-700">
                  Posted Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No jobs posted yet by {companyName}.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Applicants</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>{job.title}</TableCell>
                          <TableCell>{job.area}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>
                            {new Date(job.deadline).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{job.applications.length}</TableCell>
                          <TableCell>
                            <Button
                              variant="link"
                              onClick={() => handleViewApplicants(job.id)}
                            >
                              View Applicants
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
