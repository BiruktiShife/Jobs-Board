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

type TableData = Job | Applicant | Company | AppliedJobRow;

export type ColumnName =
  | "Title"
  | "Posted Date"
  | "Company"
  | "Applications"
  | "Name"
  | "Job"
  | "Admin Email"
  | "Email"
  | "Job Title"
  | "Applied On"
  | "Status";

type DataKey =
  | "title"
  | "postedDate"
  | "company"
  | "applications"
  | "name"
  | "job"
  | "adminEmail"
  | "email"
  | "jobTitle"
  | "appliedOn"
  | "status";

interface TableProps {
  data: TableData[];
  columns: ColumnName[];
  onCellClick?: (row: TableData, column: ColumnName) => void; // Added prop
}

const columnIcons: Record<ColumnName, React.ReactNode> = {
  Title: <Briefcase className="w-4 h-4 mr-2" />,
  "Posted Date": <Calendar className="w-4 h-4 mr-2" />,
  Applications: <Users className="w-4 h-4 mr-2" />,
  Company: <Building className="w-4 h-4 mr-2" />,
  Name: <User className="w-4 h-4 mr-2" />,
  Job: <Briefcase className="w-4 h-4 mr-2" />,
  "Admin Email": <Mail className="w-4 h-4 mr-2" />,
  Email: <Mail className="w-4 h-4 mr-2" />,
  "Job Title": <FileText className="w-4 h-4 mr-2" />,
  "Applied On": <Calendar className="w-4 h-4 mr-2" />,
  Status: <CheckCircle className="w-4 h-4 mr-2" />,
};

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md",
  Approved: "bg-green-100 text-green-800 px-2 py-1 rounded-md",
  Rejected: "bg-red-100 text-red-800 px-2 py-1 rounded-md",
  Reviewed: "bg-blue-100 text-blue-800 px-2 py-1 rounded-md",
};

export function CustomTable({ data, columns, onCellClick }: TableProps) {
  const columnKeyMap: Record<ColumnName, DataKey> = {
    Title: "title",
    "Posted Date": "postedDate",
    Applications: "applications",
    Company: "company",
    Name: "name",
    Job: "job",
    "Admin Email": "adminEmail",
    Email: "email",
    "Job Title": "jobTitle",
    "Applied On": "appliedOn",
    Status: "status",
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
          {value}
        </Badge>
      );
    }

    if (column === "Applications") {
      return (
        <div className="flex items-center">
          <span className="bg-green-200 px-14 py-1 rounded-lg">{value}</span>
        </div>
      );
    }

    if (column === "Posted Date" || column === "Applied On") {
      return new Date(value).toLocaleDateString();
    }

    if (column === "Email") {
      return (
        <a
          href={`mailto:${value}`}
          className="text-blue-600 hover:underline flex items-center"
        >
          {value}
        </a>
      );
    }

    return value;
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
                    {formatCellValue(
                      column,
                      (row as any)[columnKeyMap[column]] ?? "N/A"
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
