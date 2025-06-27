"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Loader2,
  UserIcon,
  Search,
  Users,
  Filter,
  Download,
  Eye,
  Mail,
  Calendar,
  GraduationCap,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { BsArrowLeft } from "react-icons/bs";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  applications: Application[];
}

interface Application {
  id: string;
  fullName: string;
  email: string;
  yearOfBirth: number;
  address: string;
  phone: string;
  portfolio?: string;
  profession: string;
  careerLevel: string;
  coverLetter: string;
  experiences: {
    jobTitle: string;
    company_name: string;
    location: string;
    responsibilities: string;
  }[];
  degreeType: string;
  institution: string;
  graduationDate: string;
  skills: string[];
  certifications: string[];
  languages: string[];
  projects?: string;
  volunteerWork?: string;
  resumeUrl?: string;
  createdAt: string;
  status?: string;
}

export default function ApplicantDetails() {
  const router = useRouter();
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [filteredApplicants, setFilteredApplicants] = useState<Application[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [careerLevelFilter, setCareerLevelFilter] = useState<string | null>(
    null
  );
  const [degreeTypeFilter, setDegreeTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const careerLevels = [
    "Senior Executive(C Level)",
    "Executive(VP, Director)",
    "Senior(5-8 years)",
    "Mid Level(3-5 years)",
    "Junior Level(1-3 years)",
  ];

  const statusOptions = ["Pending", "Reviewed", "Accepted", "Rejected"];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "Rejected":
        return <XCircle className="h-4 w-4" />;
      case "Reviewed":
        return <Eye className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "text-green-600 bg-green-50 border-green-200";
      case "Rejected":
        return "text-red-600 bg-red-50 border-red-200";
      case "Reviewed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-amber-600 bg-amber-50 border-amber-200";
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(
        `/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Failed to update application status");

      setFilteredApplicants((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      toast.success("Status Updated", {
        description: `Applicant status has been updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error", {
        description: "Failed to update applicant status.",
      });
    }
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`/api/company-jobs/${jobId}`);
        if (!response.ok) throw new Error("Failed to fetch job details");
        const data = await response.json();
        setJob({
          id: data.id,
          title: data.title,
          applications: data.applications || [],
        });
      } catch (error) {
        console.error("Error fetching job details:", error);
        setError("Failed to load job details");
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    if (!job || !job.applications) {
      setFilteredApplicants([]);
      return;
    }

    let applicants = job.applications;
    if (searchQuery) {
      applicants = applicants.filter(
        (app) =>
          app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (careerLevelFilter && careerLevelFilter !== "all") {
      applicants = applicants.filter(
        (app) => app.careerLevel === careerLevelFilter
      );
    }
    if (degreeTypeFilter && degreeTypeFilter !== "all") {
      applicants = applicants.filter(
        (app) => app.degreeType.toLowerCase() === degreeTypeFilter.toLowerCase()
      );
    }
    if (statusFilter && statusFilter !== "all") {
      applicants = applicants.filter(
        (app) => (app.status || "Pending") === statusFilter
      );
    }
    setFilteredApplicants(applicants);
  }, [job, searchQuery, careerLevelFilter, degreeTypeFilter, statusFilter]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplicants = filteredApplicants.slice(startIndex, endIndex);

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

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, careerLevelFilter, degreeTypeFilter, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading applicants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Error Loading Data
          </h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <header className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600 shadow-sm"
                onClick={() => router.push("/dashboard/company")}
              >
                <BsArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
                  {job?.title || "Job"} Applicants
                </h1>
                <p className="text-slate-600 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {filteredApplicants.length} total applicant
                  {filteredApplicants.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="text-slate-600 border-slate-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>

        {/* Enhanced Filters Card */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Filter & Search Applicants
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Select
                  value={careerLevelFilter || undefined}
                  onValueChange={setCareerLevelFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-10 border-slate-300">
                    <Briefcase className="h-4 w-4 mr-2 text-slate-500" />
                    <SelectValue placeholder="Career Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {careerLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter || undefined}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-full sm:w-[140px] h-10 border-slate-300">
                    <AlertCircle className="h-4 w-4 mr-2 text-slate-500" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredApplicants.length === 0 ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed border-slate-200 m-6 p-8 text-center animate-in fade-in-50">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <UserIcon className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">
                  No applicants found
                </h3>
                <p className="mb-4 mt-2 text-sm text-slate-500 max-w-md">
                  {searchQuery ||
                  careerLevelFilter ||
                  degreeTypeFilter ||
                  statusFilter
                    ? "Try adjusting your filters or search query to find more applicants"
                    : "No applicants have applied for this position yet. Share your job posting to attract candidates."}
                </p>
                {(searchQuery ||
                  careerLevelFilter ||
                  degreeTypeFilter ||
                  statusFilter) && (
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-600 hover:bg-slate-50"
                    onClick={() => {
                      setSearchQuery("");
                      setCareerLevelFilter(null);
                      setDegreeTypeFilter(null);
                      setStatusFilter(null);
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-b border-slate-200">
                      <TableHead className="font-semibold text-slate-700 py-4">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          Applicant
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Contact
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Experience
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Education
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Applied
                        </div>
                      </TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentApplicants.map((applicant) => (
                      <TableRow
                        key={applicant.id}
                        className="cursor-pointer hover:bg-blue-50/50 transition-colors duration-200 border-b border-slate-100"
                        onClick={(e) => {
                          if (
                            !(e.target as HTMLElement).closest(".status-select")
                          ) {
                            router.push(
                              `/applicant/${applicant.id}?jobId=${jobId}`
                            );
                          }
                        }}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                              {applicant.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {applicant.fullName}
                              </p>
                              <p className="text-sm text-slate-500">
                                {applicant.profession}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <a
                              href={`mailto:${applicant.email}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {applicant.email}
                            </a>
                            <p className="text-sm text-slate-500 mt-1">
                              {applicant.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <p className="font-medium text-slate-800">
                              {applicant.careerLevel}
                            </p>
                            <p className="text-sm text-slate-500">
                              {applicant.experiences?.length > 0
                                ? `${applicant.experiences.length} experience${applicant.experiences.length !== 1 ? "s" : ""}`
                                : "No experience listed"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <p className="font-medium text-slate-800">
                              {applicant.degreeType}
                            </p>
                            <p className="text-sm text-slate-500">
                              {applicant.institution}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <p className="font-medium text-slate-800">
                              {new Date(applicant.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                            <p className="text-sm text-slate-500">
                              {new Date(applicant.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                }
                              )}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <div
                            className="status-select"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Select
                              value={applicant.status || "Pending"}
                              onValueChange={(value) =>
                                updateApplicationStatus(applicant.id, value)
                              }
                            >
                              <SelectTrigger
                                className={`w-[130px] h-9 border-0 ${getStatusColor(applicant.status || "Pending")} font-medium`}
                              >
                                <div className="flex items-center gap-2">
                                  {/* {getStatusIcon(applicant.status || "Pending")} */}
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((status) => (
                                  <SelectItem
                                    key={status}
                                    value={status}
                                    className="font-medium"
                                  >
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(status)}
                                      {status}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
                    <div className="text-sm text-slate-600 font-medium mb-4 sm:mb-0">
                      Showing{" "}
                      <span className="font-semibold text-slate-800">
                        {startIndex + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold text-slate-800">
                        {Math.min(endIndex, filteredApplicants.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-slate-800">
                        {filteredApplicants.length}
                      </span>{" "}
                      applicants
                    </div>
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
      </div>
    </div>
  );
}
