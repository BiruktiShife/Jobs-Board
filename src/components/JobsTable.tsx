import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import {
  AlertCircle,
  Loader2,
  Briefcase,
  Building,
  Calendar,
  Search,
  Filter,
  Eye,
  Users,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  postedDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface JobsTableProps {
  jobs: Job[];
  titleFilter: string;
  companyFilter: string;
  statusFilter: "ALL" | "PENDING" | "APPROVED" | "REJECTED";
  setTitleFilter: (value: string) => void;
  setCompanyFilter: (value: string) => void;
  setStatusFilter: (value: "ALL" | "PENDING" | "APPROVED" | "REJECTED") => void;
  handleViewApplicants: (jobId: string) => void;
  loading: boolean;
  error: string | null;
}

export function JobsTable({
  jobs,
  titleFilter,
  companyFilter,
  statusFilter,
  setTitleFilter,
  setCompanyFilter,
  setStatusFilter,
  handleViewApplicants,
  loading,
  error,
}: JobsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 font-medium">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-900 mb-1">
              Error Loading Jobs
            </h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filter Jobs</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by title..."
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                className="pl-10 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by company..."
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="pl-10 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      All Status
                    </div>
                  </SelectItem>
                  <SelectItem value="PENDING">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="APPROVED">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Approved
                    </div>
                  </SelectItem>
                  <SelectItem value="REJECTED">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Rejected
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white/50 backdrop-blur-sm shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200">
              <TableHead className="font-semibold text-gray-700 py-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Job Title
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Company
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Posted Date
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Status
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-700 py-4">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        No jobs found
                      </h3>
                      <p className="text-gray-500">
                        No jobs match your current filters.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job, index) => (
                <TableRow
                  key={job.id}
                  className={`hover:bg-blue-50/50 transition-colors border-b border-gray-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {job.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {job.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 font-medium">
                        {job.company}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{job.postedDate}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      className={`${
                        job.status === "APPROVED"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : job.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                            : "bg-red-100 text-red-700 border-red-200"
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
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/jobs/job-form?id=${job.id}&mode=review`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewApplicants(job.id)}
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Applicants
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
