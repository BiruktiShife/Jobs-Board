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
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-900 mb-1">
              Configuration Error
            </h4>
            <p className="text-sm text-red-700">
              Table columns not provided. Please check the component
              configuration.
            </p>
          </div>
        </div>
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
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white/50 backdrop-blur-sm shadow-lg">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200">
            {columns.map((column) => (
              <TableHead
                key={column}
                className="py-4 px-4 font-semibold text-gray-700"
              >
                <div className="flex items-center gap-2">
                  {columnIcons[column]}
                  {column}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      No data available
                    </h3>
                    <p className="text-gray-500">
                      There are no items to display at the moment.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={index}
                className={`hover:bg-blue-50/50 transition-colors border-b border-gray-100 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column}
                    className={cn(
                      "py-4 px-4",
                      column === "Applications" &&
                        "cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
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
