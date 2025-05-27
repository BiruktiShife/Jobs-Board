import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Briefcase,
  Calendar,
  Users,
  User,
  Mail,
  Building,
  CheckCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  postedDate: string;
  applications: number;
}

interface AppliedJobRow {
  title: string;
  company: string;
  status: string;
  appliedOn: string;
}

interface Applicant {
  id: string;
  name: string;
  jobTitle: string;
  email: string;
  company: string;
  appliedOn: string;
}

interface Company {
  name: string;
  adminEmail: string;
}

export interface BookmarkTableData {
  id: string;
  title: string;
  company_name: string;
}

export type TableData =
  | Job
  | Applicant
  | Company
  | AppliedJobRow
  | BookmarkTableData;

export type ColumnName =
  | "Title"
  | "Posted Date"
  | "Company"
  | "Company Name"
  | "Applications"
  | "Name"
  | "Job"
  | "Admin Email"
  | "Email"
  | "Job Title"
  | "Applied On"
  | "Status"
  | "Actions";

type DataKey =
  | "title"
  | "postedDate"
  | "company"
  | "company_name"
  | "applications"
  | "name"
  | "job"
  | "adminEmail"
  | "email"
  | "jobTitle"
  | "appliedOn"
  | "status"
  | "actions";

interface TableProps {
  data: TableData[];
  columns: ColumnName[];
  onCellClick?: (row: TableData, column: ColumnName) => void;
  renderCell?: (row: TableData, column: ColumnName) => React.ReactNode;
}

const columnIcons: Record<ColumnName, React.ReactNode> = {
  Title: <Briefcase className="w-4 h-4 mr-2" />,
  "Posted Date": <Calendar className="w-4 h-4 mr-2" />,
  Applications: <Users className="w-4 h-4 mr-2" />,
  Company: <Building className="w-4 h-4 mr-2" />,
  "Company Name": <Building className="w-4 h-4 mr-2" />,
  Name: <User className="w-4 h-4 mr-2" />,
  Job: <Briefcase className="w-4 h-4 mr-2" />,
  "Admin Email": <Mail className="w-4 h-4 mr-2" />,
  Email: <Mail className="w-4 h-4 mr-2" />,
  "Job Title": <FileText className="w-4 h-4 mr-2" />,
  "Applied On": <Calendar className="w-4 h-4 mr-2" />,
  Status: <CheckCircle className="w-4 h-4 mr-2" />,
  Actions: <CheckCircle className="w-4 h-4 mr-2" />,
};

const statusColors: Record<string, string> = {
  Pending: " text-yellow-800",
  Approved: " text-green-800",
  Rejected: " text-red-800",
  Reviewed: "text-blue-800",
};

export function CustomTable({
  data,
  columns,
  onCellClick,
  renderCell,
}: TableProps) {
  const columnKeyMap: Record<ColumnName, DataKey> = {
    Title: "title",
    "Posted Date": "postedDate",
    Applications: "applications",
    Company: "company",
    "Company Name": "company_name",
    Name: "name",
    Job: "job",
    "Admin Email": "adminEmail",
    Email: "email",
    "Job Title": "title",
    "Applied On": "appliedOn",
    Status: "status",
    Actions: "actions",
  };

  if (!columns) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        Error: Columns not provided
      </div>
    );
  }

  const formatCellValue = (column: ColumnName, value: any) => {
    if (column === "Status") {
      return (
        <Badge
          className={cn(
            "capitalize",
            statusColors[value] || "bg-gray-100 text-gray-800"
          )}
        >
          {value ?? "N/A"}
        </Badge>
      );
    }

    if (column === "Applications") {
      return (
        <div className="flex items-center">
          <span className="px-14 font-medium">{value ?? "N/A"}</span>
        </div>
      );
    }

    if (column === "Posted Date" || column === "Applied On") {
      return value ? new Date(value).toLocaleDateString() : "N/A";
    }

    if (column === "Email") {
      return (
        <a
          href={`mailto:${value}`}
          className="text-blue-600 hover:underline flex items-center font-medium"
        >
          {value ?? "N/A"}
        </a>
      );
    }

    return value ?? "N/A";
  };

  return (
    <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <Table className="min-w-full">
        <TableHeader className="bg-gray-50">
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column}
                className="py-3 px-4 font-semibold text-gray-700"
              >
                <div className="flex items-center">
                  {columnIcons[column]}
                  {column}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-8 text-center text-gray-500"
              >
                <div className="flex flex-col items-center justify-center">
                  <FileText className="w-10 h-10 text-gray-400 mb-2" />
                  No data available
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={index}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((column) => (
                  <TableCell
                    key={column}
                    className={cn(
                      "py-3 px-4 whitespace-nowrap",
                      column === "Applications" &&
                        "cursor-pointer text-green-600 hover:text-green-800"
                    )}
                    onClick={() =>
                      column === "Applications" && onCellClick?.(row, column)
                    }
                  >
                    {renderCell
                      ? renderCell(row, column)
                      : formatCellValue(
                          column,
                          (row as any)[columnKeyMap[column]]
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
