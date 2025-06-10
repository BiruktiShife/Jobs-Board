"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  AlertCircle,
  EllipsisVerticalIcon,
  FileText,
  PlusIcon,
  Trash2,
  Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const ITEMS_PER_PAGE = 10;

  const parseDeadline = (deadline: string | null | undefined): Date | null => {
    if (!deadline || deadline.trim() === "") {
      return null;
    }
    if (typeof deadline !== "string") {
      console.error(`Invalid deadline type: ${JSON.stringify(deadline)}`);
      return null;
    }
    const parsedDate = new Date(deadline);
    if (isNaN(parsedDate.getTime())) {
      console.warn(`Unparseable deadline: "${deadline}"`);
      return null;
    }
    return parsedDate;
  };

  const isJobClosed = (job: Job): boolean => {
    const deadline = parseDeadline(job.deadline);
    if (!deadline) {
      return true;
    }
    const now = new Date();
    const nowUTC = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      )
    );
    const deadlineUTC = new Date(
      Date.UTC(
        deadline.getUTCFullYear(),
        deadline.getUTCMonth(),
        deadline.getUTCDate(),
        deadline.getUTCHours(),
        deadline.getUTCMinutes(),
        deadline.getUTCSeconds()
      )
    );
    return deadlineUTC < nowUTC;
  };

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
      const isClosed = isJobClosed(job);
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
    if (error || deleteError) {
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {deleteError || error}
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Applied On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedApplicants.map((applicant) => (
              <TableRow key={applicant.id}>
                <TableCell>{applicant.name}</TableCell>
                <TableCell>{applicant.email}</TableCell>
                <TableCell>{applicant.jobTitle}</TableCell>
                <TableCell>
                  {new Date(applicant.appliedOn).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    if (type === "jobs") {
      if (paginatedJobs.length === 0) {
        return (
          <div className="py-8 text-center text-gray-500">No jobs found</div>
        );
      }
      return (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Posted Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{job.title}</TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>
                      {new Date(job.postedDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={job.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/jobs/job-form?id=${job.id}&mode=review`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewApplicants(job.id)}
                        >
                          View Applicants
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {getPaginationLinks()}
        </div>
      );
    }

    if (paginatedCompanies.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500">No companies found</div>
      );
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Admin Email</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCompanies.map((company) => (
            <TableRow key={company.id}>
              <TableCell>{company.name}</TableCell>
              <TableCell>{company.adminEmail}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      disabled={isPending}
                    >
                      <EllipsisVerticalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/create-company?id=${company.id}`}
                        className="flex items-center"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => {
                        setDeleteId(company.id);
                        setDeleteType("company");
                      }}
                      className="flex items-center"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <Card className="flex w-full flex-col gap-4">
        <CardHeader className="flex flex-row items-center justify-between">
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
          >
            <TabsList className="w-full @3xl/page:w-fit">
              <TabsTrigger value="ALL">
                All {type === "jobs" ? "Jobs" : "Companies"}
              </TabsTrigger>
              {type === "jobs" && (
                <>
                  <TabsTrigger value="PENDING">Pending</TabsTrigger>
                  <TabsTrigger value="APPROVED">Approved</TabsTrigger>
                  <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
                </>
              )}
              <TabsTrigger value="add-item" asChild>
                <Link
                  href={type === "jobs" ? "/jobs/job-form" : "/create-company"}
                >
                  <button>
                    <PlusIcon />
                  </button>
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="hidden items-center gap-2 @3xl/page:flex">
            {type === "jobs" && !showApplicantsForJob && (
              <>
                <Input
                  placeholder="Filter by Title"
                  value={titleFilter}
                  onChange={(e) => {
                    setTitleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="max-w-xs"
                />
                <Input
                  placeholder="Filter by Company"
                  value={companyFilter}
                  onChange={(e) => {
                    setCompanyFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="max-w-xs"
                />
              </>
            )}
            {type === "companies" && (
              <Input
                placeholder="Filter by Name"
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="max-w-xs"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>{loading ? <TableSkeleton /> : renderTable()}</CardContent>
        <CardFooter className="flex flex-col items-center justify-between border-t pt-6 @3xl/page:flex-row">
          <div className="text-muted-foreground hidden text-sm @3xl/page:block">
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
            items
          </div>
          <Pagination className="mx-0 w-fit">
            <PaginationContent>
              <PaginationItem>
                {currentPage === 1 ? (
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                ) : (
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                  />
                )}
              </PaginationItem>
              {getPaginationLinks().map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {totalPages > 10 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                {currentPage === totalPages ? (
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                ) : (
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                  />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
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
    </>
  );
}
