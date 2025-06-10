import { Button } from "@/components/ui/button";
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
import { AlertCircle, Loader2 } from "lucide-react";

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
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500 p-4">
        <AlertCircle className="w-4 h-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-2">
          <Input
            placeholder="Filter by title..."
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            className="max-w-xs"
          />
          <Input
            placeholder="Filter by company..."
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

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
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell>{job.postedDate}</TableCell>
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
    </div>
  );
}
