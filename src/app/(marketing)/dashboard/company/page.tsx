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
import {
  ArrowRight,
  Briefcase,
  Calendar,
  FileText,
  Loader2,
  MapPin,
  PlusCircle,
  Users,
} from "lucide-react";

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
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 sm:p-6">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-xl sm:text-3xl font-bold text-green-800 flex items-center">
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 mr-3 text-green-600" />
              {companyName} Dashboard
            </h1>
            <Profile email={session?.user?.email || "admin@company.com"} />
          </div>
          <div className="flex justify-start">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white flex items-center w-full sm:w-auto px-3 sm:px-4 py-2"
              onClick={() => router.push("/jobs/company-job-form")}
            >
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Post New Job
            </Button>
          </div>
        </header>

        <Tabs defaultValue="jobs" className="space-y-6 w-full">
          <TabsContent value="jobs">
            <Card className="shadow-lg hover:shadow-xl transition-shadow border border-green-100 w-full">
              <CardHeader className="bg-green-50 rounded-t-lg">
                <CardTitle className="text-lg sm:text-xl font-semibold text-green-800 flex items-center py-3">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Posted Jobs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Briefcase className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">
                      No jobs posted yet
                    </h3>
                    <p className="mt-2 text-sm sm:text-base text-gray-500">
                      Get started by posting your first job opening
                    </p>
                    <Button
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto px-3 sm:px-4 py-2"
                      onClick={() => router.push("/jobs/company-job-form")}
                    >
                      <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Post a Job
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="min-w-[150px] sm:min-w-[200px] text-sm sm:text-base p-2 sm:p-4">
                            <span className="inline-flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-green-600" />
                              Title
                            </span>
                          </TableHead>
                          <TableHead className="text-sm sm:text-base p-2 sm:p-4">
                            <span className="inline-flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-green-600" />
                              Area
                            </span>
                          </TableHead>
                          <TableHead className="text-sm sm:text-base p-2 sm:p-4">
                            <span className="inline-flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-green-600" />
                              Location
                            </span>
                          </TableHead>
                          <TableHead className="text-sm sm:text-base p-2 sm:p-4">
                            <span className="inline-flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-green-600" />
                              Deadline
                            </span>
                          </TableHead>
                          <TableHead className="text-sm sm:text-base p-2 sm:p-4">
                            <span className="inline-flex items-center">
                              <Users className="h-4 w-4 mr-2 text-green-600" />
                              Applicants
                            </span>
                          </TableHead>
                          <TableHead className="text-right text-sm sm:text-base p-2 sm:p-4">
                            Details
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job) => {
                          const isDeadlinePassed =
                            new Date(job.deadline) < new Date();
                          return (
                            <TableRow
                              key={job.id}
                              className="hover:bg-green-50"
                            >
                              <TableCell className="font-medium text-sm sm:text-base p-2 sm:p-4">
                                {job.title}
                              </TableCell>
                              <TableCell className="text-sm sm:text-base p-2 sm:p-4">
                                <div className="bg-blue-50 text-blue-800 px-2 py-1 rounded-md">
                                  {job.area}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm sm:text-base p-2 sm:p-4">
                                {job.location}
                              </TableCell>
                              <TableCell className="text-sm sm:text-base p-2 sm:p-4">
                                <div
                                  className={`flex items-center bg-purple-50 text-purple-800 px-2 py-1 rounded-md ${
                                    isDeadlinePassed
                                      ? "text-red-600"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <Calendar className="h-4 w-4 mr-2" />
                                  {new Date(job.deadline).toLocaleDateString()}
                                  {isDeadlinePassed && (
                                    <span className="ml-2 text-xs text-red-500">
                                      (Closed)
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm sm:text-base p-2 sm:p-4">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2 text-green-600" />
                                  <div className="text-green-800">
                                    {job.applications.length}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right p-2 sm:p-4">
                                <Button
                                  variant="outline"
                                  className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto px-3 sm:px-4 py-2"
                                  onClick={() => handleViewApplicants(job.id)}
                                >
                                  View
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
