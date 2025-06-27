"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  AlertCircle,
  FileText,
  PlusIcon,
  Trash2,
  Pencil,
  Building,
  Calendar,
  Mail,
  Briefcase,
  MoreHorizontal,
  Users,
  Eye,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/StatusBadge";

interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  logo: string;
  area: string;
  location: string;
  deadline: string;
  site: "Full_time" | "Part_time" | "Freelance";
  about_job: string;
  qualifications: string[];
  responsibilities: string[];
  requiredSkills: string[];
  postedDate: string;
  applications: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface Applicant {
  id: string;
  name: string;
  jobId: string;
  jobTitle: string;
  company: string;
  email: string;
  appliedOn: string;
}

interface Company {
  id: string;
  name: string;
  adminEmail: string;
}

interface ProductsTableProps {
  type: "jobs" | "companies";
  jobs?: Job[];
  applicants?: Applicant[];
  companies?: Company[];
  showApplicantsForJob?: string | null;
  titleFilter?: string;
  companyFilter?: string;
  nameFilter?: string;
  setTitleFilter?: (value: string) => void;
  setCompanyFilter?: (value: string) => void;
  setNameFilter?: (value: string) => void;
  handleViewApplicants?: (jobId: string) => void;
  handleBackToJobs?: () => void;
  loading: boolean;
  error: string | null;
  dataWarning?: string | null;
  statusFilter?: "ALL" | "PENDING" | "APPROVED" | "REJECTED";
  setStatusFilter?: (
    value: "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  ) => void;
}

export function ProductsTable({
  type,
  jobs = [],
  applicants = [],
  companies = [],
  showApplicantsForJob = null,
  titleFilter = "",
  companyFilter = "",
  nameFilter = "",
  setTitleFilter = () => {},
  setCompanyFilter = () => {},
  setNameFilter = () => {},
  handleViewApplicants = () => {},
  loading,
  error = null,
  dataWarning = null,
  statusFilter = "ALL",
  setStatusFilter = () => {},
}: ProductsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"job" | "company" | null>(null);
  const [, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const ITEMS_PER_PAGE = 10;

  const handleDeleteJob = async (id: string) => {
    setDeleteError(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/jobs/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete job");
        }
        jobs = jobs.filter((job) => job.id !== id);
      } catch (err) {
        console.error(err);
        setDeleteError("Failed to delete job. Please try again.");
      } finally {
        setDeleteId(null);
        setDeleteType(null);
      }
    });
  };

  const handleDeleteCompany = async (id: string) => {
    setDeleteError(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/companies/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to delete company");
        }
        // Refresh the page after successful deletion
        window.location.reload();
      } catch (err) {
        console.error(err);
        setDeleteError("Failed to delete company. Please try again.");
      } finally {
        setDeleteId(null);
        setDeleteType(null);
      }
    });
  };

  const filteredJobs = jobs
    .filter((job) => {
      const matchesTitle = job.title
        .toLowerCase()
        .includes(titleFilter.toLowerCase());
      const matchesCompany = job.company
        .toLowerCase()
        .includes(companyFilter.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PENDING" && job.status === "PENDING") ||
        (statusFilter === "APPROVED" && job.status === "APPROVED") ||
        (statusFilter === "REJECTED" && job.status === "REJECTED");
      return matchesTitle && matchesCompany && matchesStatus;
    })
    .sort(
      (a, b) =>
        new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(nameFilter.toLowerCase())
  );

  const filteredApplicants = showApplicantsForJob
    ? applicants.filter((applicant) => applicant.jobId === showApplicantsForJob)
    : [];

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(
    (type === "jobs" && !showApplicantsForJob
      ? filteredJobs
      : type === "companies"
        ? filteredCompanies
        : filteredApplicants
    ).length / ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPaginationLinks = () => {
    const links = [];
    const maxLinks = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxLinks / 2));
    const endPage = Math.min(totalPages, startPage + maxLinks - 1);
    if (endPage - startPage + 1 < maxLinks) {
      startPage = Math.max(1, endPage - maxLinks + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      links.push(i);
    }
    return links;
  };

  const TableSkeleton = () => (
    <div className="space-y-2">
      {[...Array(10)].map((_, i) => (
        <TableRow key={i}>
          {[...Array(6)].map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </div>
  );

  const renderTable = () => {
    if (loading) {
      return <TableSkeleton />;
    }

    if (error) {
      return (
        <div className="flex items-center justify-center p-4 text-red-500">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      );
    }

    if (dataWarning && type === "jobs" && !showApplicantsForJob) {
      return (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {dataWarning}
        </div>
      );
    }

    if (showApplicantsForJob) {
      if (paginatedApplicants.length === 0) {
        return (
          <div className="py-8 text-center text-gray-500">
            <div className="flex flex-col items-center justify-center">
              <FileText className="w-10 h-10 text-gray-400 mb-2" />
              No applicants found for this job
            </div>
          </div>
        );
      }

      return (
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white/50 ">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200">
                <TableHead className="font-semibold text-gray-700 py-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Applicant Name
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Job Title
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Applied On
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedApplicants.map((applicant, index) => (
                <TableRow
                  key={applicant.id}
                  className={`hover:bg-green-50/50 transition-colors border-b border-gray-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {applicant.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {applicant.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 font-medium">
                        {applicant.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {applicant.jobTitle}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {new Date(applicant.appliedOn).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (type === "jobs") {
      if (paginatedJobs.length === 0) {
        return (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              No jobs match your current filters. Try adjusting your search
              criteria.
            </p>
          </div>
        );
      }
      return (
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white/50">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Job Title
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Company
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Posted Date
                  </div>
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
              {paginatedJobs.map((job, index) => (
                <TableRow
                  key={job.id}
                  className={`hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? "bg-white/50" : "bg-gray-50/30"}`}
                >
                  <TableCell className="font-semibold text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-purple-600" />
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
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{job.company}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {new Date(job.postedDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={job.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/jobs/job-form?id=${job.id}&mode=review`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewApplicants(job.id)}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Applicants
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (paginatedCompanies.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No companies found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            No companies match your current filters. Try adjusting your search
            criteria.
          </p>
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white/50 backdrop-blur-sm shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200">
              <TableHead className="font-semibold text-gray-700 py-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Company Name
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Admin Email
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-700 py-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCompanies.map((company, index) => (
              <TableRow
                key={company.id}
                className={`hover:bg-blue-50/50 transition-colors border-b border-gray-100 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {company.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {company.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 font-medium">
                      {company.adminEmail}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                        disabled={isPending}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/create-company?id=${company.id}`}
                          className="flex items-center"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Company
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDeleteId(company.id);
                          setDeleteType("company");
                        }}
                        className="flex items-center text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Company
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="border-b border-gray-100 pb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Status Tabs */}
            <Tabs
              value={showApplicantsForJob ? "applicants" : statusFilter}
              onValueChange={(value) => {
                if (value === "add-item") return;
                if (value === "applicants") return;
                setStatusFilter(
                  value as "ALL" | "PENDING" | "APPROVED" | "REJECTED"
                );
                setCurrentPage(1);
              }}
              className="w-full lg:w-auto"
            >
              <TabsList className="bg-gray-100/80 p-1 rounded-xl">
                <TabsTrigger
                  value="ALL"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  All {type === "jobs" ? "Jobs" : "Companies"}
                </TabsTrigger>
                {type === "jobs" && (
                  <>
                    <TabsTrigger
                      value="PENDING"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Pending
                    </TabsTrigger>
                    <TabsTrigger
                      value="APPROVED"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Approved
                    </TabsTrigger>
                    <TabsTrigger
                      value="REJECTED"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Rejected
                    </TabsTrigger>
                  </>
                )}
                <TabsTrigger value="add-item" asChild>
                  <Link
                    href={
                      type === "jobs" ? "/jobs/job-form" : "/create-company"
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white data-[state=active]:bg-blue-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add {type === "jobs" ? "Job" : "Company"}
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search Filters */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {type === "jobs" && !showApplicantsForJob && (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by title..."
                      value={titleFilter}
                      onChange={(e) => {
                        setTitleFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by company..."
                      value={companyFilter}
                      onChange={(e) => {
                        setCompanyFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              {type === "companies" && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name..."
                    value={nameFilter}
                    onChange={(e) => {
                      setNameFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderTable()}</CardContent>
        <CardFooter className="bg-gray-50/50 border-t border-gray-100 pt-6">
          <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-4">
            {/* Results Info */}
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(
                currentPage * ITEMS_PER_PAGE,
                (type === "jobs" && !showApplicantsForJob
                  ? filteredJobs
                  : type === "companies"
                    ? filteredCompanies
                    : filteredApplicants
                ).length
              )}{" "}
              of{" "}
              {
                (type === "jobs" && !showApplicantsForJob
                  ? filteredJobs
                  : type === "companies"
                    ? filteredCompanies
                    : filteredApplicants
                ).length
              }{" "}
              {type === "jobs" && !showApplicantsForJob
                ? "jobs"
                : type === "companies"
                  ? "companies"
                  : "applicants"}
            </div>

            {/* Pagination */}
            <Pagination className="mx-0 w-fit">
              <PaginationContent>
                <PaginationItem>
                  {currentPage === 1 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="border-gray-300 text-gray-400"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                  )}
                </PaginationItem>

                {getPaginationLinks().map((page) => (
                  <PaginationItem key={page}>
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={
                        currentPage === page
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }
                    >
                      {page}
                    </Button>
                  </PaginationItem>
                ))}

                {totalPages > 10 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <span className="px-2 text-gray-400">...</span>
                  </PaginationItem>
                )}

                <PaginationItem>
                  {currentPage === totalPages ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="border-gray-300 text-gray-400"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardFooter>
      </Card>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this {deleteType}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              {deleteType === "job" ? "job posting" : "company"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteType === "job" && deleteId) {
                  handleDeleteJob(deleteId);
                } else if (deleteType === "company" && deleteId) {
                  handleDeleteCompany(deleteId);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
