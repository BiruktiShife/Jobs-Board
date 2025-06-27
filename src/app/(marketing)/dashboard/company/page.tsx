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
import { Profile } from "@/components/header";
import { Loading } from "@/components/ui/loading";
import {
  Briefcase,
  Loader2,
  PlusCircle,
  Search,
  Building,
  Users,
  TrendingUp,
  Calendar,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
} from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

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

interface CompanyProfile {
  id: string;
  name: string;
  adminEmail: string;
  address: string;
  logo: string;
  licenseUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function CompanyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [titleFilter, setTitleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  // Calculate dashboard statistics
  const totalJobs = jobs.length;
  const totalApplications = jobs.reduce(
    (sum, job) => sum + job.applications.length,
    0
  );
  const activeJobs = jobs.filter(
    (job) => new Date(job.deadline) > new Date()
  ).length;
  const approvedJobs = jobs.filter((job) => job.status === "APPROVED").length;

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "COMPANY_ADMIN") {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch company profile first to check approval status
        const profileResponse = await fetch("/api/company/profile");
        if (!profileResponse.ok) {
          throw new Error(
            `Failed to fetch company profile: ${profileResponse.statusText}`
          );
        }
        const profileData = await profileResponse.json();
        setCompanyProfile(profileData);

        // Check if company is approved before fetching jobs
        if (profileData.status !== "APPROVED") {
          setLoading(false);
          return; // Don't fetch jobs if not approved
        }

        // Fetch jobs only if company is approved
        const jobsResponse = await fetch("/api/company-jobs");
        if (!jobsResponse.ok) {
          throw new Error(`Failed to fetch jobs: ${jobsResponse.statusText}`);
        }
        const jobsData = await jobsResponse.json();
        const validJobs = Array.isArray(jobsData.jobs)
          ? jobsData.jobs.map((job: Job) => ({
              ...job,
              applications: job.applications || [],
            }))
          : [];
        setJobs(validJobs);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load company data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  if (loading) {
    return (
      <Loading
        variant="page"
        text="Loading company dashboard"
        icon="building"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show approval status screen for non-approved companies
  if (companyProfile && companyProfile.status !== "APPROVED") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            {/* Company Logo */}
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-6">
              {companyProfile.logo ? (
                <Image
                  src={companyProfile.logo}
                  alt={`${companyProfile.name} logo`}
                  fill
                  className="object-cover"
                />
              ) : (
                <Building className="w-10 h-10 text-emerald-600" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {companyProfile.name}
            </h1>

            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge
                className={`text-lg px-4 py-2 ${
                  companyProfile.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                    : "bg-red-100 text-red-700 border-red-200"
                }`}
              >
                {companyProfile.status === "PENDING" && (
                  <Clock className="w-4 h-4 mr-2" />
                )}
                {companyProfile.status === "REJECTED" && (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                {companyProfile.status === "PENDING"
                  ? "Pending Approval"
                  : "Application Rejected"}
              </Badge>
            </div>

            {companyProfile.status === "PENDING" ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Your application is under review
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Thank you for registering with JobBoard! Our admin team is
                  currently reviewing your company application. You&apos;ll
                  receive an email notification once your account is approved.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-blue-900 mb-1">
                        What happens next?
                      </h3>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Admin reviews your company information</li>
                        <li>
                          • Verification of business license and documents
                        </li>
                        <li>• Email notification upon approval</li>
                        <li>
                          • Full access to company dashboard and job posting
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Application Rejected
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Unfortunately, your company application has been rejected.
                  Please contact our support team for more information or to
                  resubmit your application.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/contact")}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Contact Support
                  </Button>
                  <Button
                    onClick={() => router.push("/register/company")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Reapply
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <span>Need help?</span>
                <Button
                  variant="link"
                  onClick={() => router.push("/contact")}
                  className="text-emerald-600 hover:text-emerald-700 p-0 h-auto"
                >
                  Contact Support
                </Button>
                <span>•</span>
                <Button
                  variant="link"
                  onClick={() => router.push("/login")}
                  className="text-emerald-600 hover:text-emerald-700 p-0 h-auto"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <header className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Company Logo */}
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                {companyProfile?.logo ? (
                  <Image
                    src={companyProfile.logo}
                    alt={`${companyProfile.name} logo`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Building className="w-8 h-8 text-emerald-600" />
                )}
              </div>

              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {companyProfile?.name || "Company"} Dashboard
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-600">{companyProfile?.address}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className={`${
                      companyProfile?.status === "APPROVED"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : companyProfile?.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                          : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {companyProfile?.status === "APPROVED" && (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    {companyProfile?.status === "PENDING" && (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {companyProfile?.status === "REJECTED" && (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {companyProfile?.status || "Unknown"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => router.push("/jobs/company-job-form")}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Post New Job
              </Button>

              <Profile email={session?.user?.email || "admin@company.com"} />
            </div>
          </div>
        </header>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-100">
                    Total Jobs
                  </p>
                  <p className="text-3xl font-bold text-white">{totalJobs}</p>
                  <p className="text-xs text-gray-100 mt-1">All time</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-100">
                    Total Applications
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {totalApplications}
                  </p>
                  <p className="text-xs text-gray-100 mt-1">Across all jobs</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-100">
                    Active Jobs
                  </p>
                  <p className="text-3xl font-bold text-white">{activeJobs}</p>
                  <p className="text-xs text-gray-100 mt-1">Currently open</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-100">
                    Approved Jobs
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {approvedJobs}
                  </p>
                  <p className="text-xs text-gray-100 mt-1">Live on platform</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center">
                  <Briefcase className="w-6 h-6 mr-3 text-emerald-600" />
                  Posted Jobs
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Manage and track your job listings
                </p>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search jobs by title..."
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 bg-white/50"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {currentJobs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {titleFilter
                    ? `No jobs match "${titleFilter}". Try adjusting your search.`
                    : "You haven't posted any jobs yet. Create your first job listing to start hiring!"}
                </p>
                {!titleFilter && (
                  <Button
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                    onClick={() => router.push("/jobs/company-job-form")}
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Post Your First Job
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-white/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80">
                        <TableHead className="font-semibold text-gray-700">
                          Job Title
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Category
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Location
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Deadline
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Applications
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Status
                        </TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentJobs.map((job, index) => (
                        <TableRow
                          key={job.id}
                          className={`hover:bg-emerald-50/50 transition-colors ${index % 2 === 0 ? "bg-white/50" : "bg-gray-50/30"}`}
                        >
                          <TableCell className="font-semibold text-gray-900">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div>
                                <p className="font-semibold">{job.title}</p>
                                <p className="text-sm text-gray-500">
                                  ID: {job.id.slice(0, 8)}...
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {job.area}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">
                                {job.location}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">
                                {new Date(job.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-gray-900">
                                {job.applications.length}
                              </span>
                              <span className="text-gray-500">applicants</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${
                                job.status === "APPROVED"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : job.status === "REJECTED"
                                    ? "bg-red-100 text-red-700 border-red-200"
                                    : "bg-yellow-100 text-yellow-700 border-yellow-200"
                              }`}
                            >
                              {job.status === "APPROVED" && (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              {job.status === "PENDING" && (
                                <Clock className="w-3 h-3 mr-1" />
                              )}
                              {job.status === "REJECTED" && (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              {job.status || "PENDING"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleViewApplicants(job.id)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-2">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            {currentPage > 1 && (
                              <PaginationPrevious
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.max(prev - 1, 1)
                                  )
                                }
                                className="hover:bg-emerald-50 hover:text-emerald-700"
                              />
                            )}
                          </PaginationItem>
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className={
                                  currentPage === page
                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                    : "hover:bg-emerald-50 hover:text-emerald-700"
                                }
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            {currentPage < totalPages && (
                              <PaginationNext
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                  )
                                }
                                className="hover:bg-emerald-50 hover:text-emerald-700"
                              />
                            )}
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
