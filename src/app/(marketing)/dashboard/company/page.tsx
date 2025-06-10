"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Briefcase,
  Loader2,
  EllipsisVerticalIcon,
  PlusCircle,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

interface Job {
  id: string;
  title: string;
  area: string;
  location: string;
  deadline: string;
  applications: Application[];
  status?: string;
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
  const [titleFilter, setTitleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

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

  // Filter jobs based on title
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(titleFilter.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }
    return pages;
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
          <div className="flex flex-row  items-center justify-between">
            <h1 className="text-xl sm:text-3xl font-bold text-green-800 flex items-center">
              {companyName} Dashboard
            </h1>
            <div className="flex flex-row gap-4 items-center">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white flex items-center w-full sm:w-auto px-3 sm:px-4 py-2"
                onClick={() => router.push("/jobs/company-job-form")}
              >
                <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Post New Job
              </Button>
              <Profile email={session?.user?.email || "admin@company.com"} />
            </div>
          </div>
        </header>

        <Tabs defaultValue="jobs" className="space-y-6 w-full">
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-xl font-semibold text-green-800">
                    Posted Jobs
                  </CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Filter by job title..."
                      value={titleFilter}
                      onChange={(e) => {
                        setTitleFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                      <Briefcase className="h-10 w-10 text-gray-500" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">
                      No jobs posted
                    </h3>
                    <p className="mb-4 mt-2 text-sm text-gray-500">
                      You haven&apos;t posted any jobs yet. Start by creating
                      your first job posting.
                    </p>
                    <Button
                      onClick={() => router.push("/jobs/company-job-form")}
                      className="relative inline-flex items-center bg-green-600 hover:bg-green-700"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Post a Job
                    </Button>
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                      <Search className="h-10 w-10 text-gray-500" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">
                      No matching jobs found
                    </h3>
                    <p className="mb-4 mt-2 text-sm text-gray-500">
                      Try adjusting your search criteria
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Area</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Deadline</TableHead>
                            <TableHead>Applicants</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentJobs.map((job) => (
                            <TableRow key={job.id}>
                              <TableCell className="font-medium">
                                {job.title}
                              </TableCell>
                              <TableCell>{job.area}</TableCell>
                              <TableCell>{job.location}</TableCell>
                              <TableCell>
                                {new Date(job.deadline).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{job.applications.length}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    job.status === "APPROVED"
                                      ? "success"
                                      : job.status === "REJECTED"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {job.status || "PENDING"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                    >
                                      <span className="sr-only">Open menu</span>
                                      <EllipsisVerticalIcon className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleViewApplicants(job.id)
                                      }
                                    >
                                      View Applicants
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {filteredJobs.length > jobsPerPage && (
                      <div className="mt-4 flex justify-center">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage > 1)
                                    setCurrentPage(currentPage - 1);
                                }}
                                className={
                                  currentPage === 1
                                    ? "pointer-events-none opacity-50"
                                    : ""
                                }
                              />
                            </PaginationItem>
                            {getPageNumbers().map((page, index) => (
                              <PaginationItem key={index}>
                                {page === "..." ? (
                                  <PaginationEllipsis />
                                ) : (
                                  <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setCurrentPage(page as number);
                                    }}
                                    isActive={currentPage === page}
                                  >
                                    {page}
                                  </PaginationLink>
                                )}
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage < totalPages)
                                    setCurrentPage(currentPage + 1);
                                }}
                                className={
                                  currentPage === totalPages
                                    ? "pointer-events-none opacity-50"
                                    : ""
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
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
