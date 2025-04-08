import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

interface Job {
  id: string;
  title: string;
  posteddate: string;
  applications: number;
}

interface Applicant {
  id: string;
  name: string;
  job: string;
  status: string;
}

interface Company {
  name: string;
  adminEmail: string;
}

type TableData = Job | Applicant | Company;

type ColumnName =
  | "Title"
  | "Posted Date"
  | "Applications"
  | "Name"
  | "Job"
  | "Status"
  | "Admin Email";

type DataKey =
  | "title"
  | "posteddate"
  | "applications"
  | "name"
  | "job"
  | "status"
  | "adminEmail";

interface TableProps {
  data: TableData[];
  columns: ColumnName[];
}

export function CustomTable({ data, columns }: TableProps) {
  console.log("CustomTable props - data:", data, "columns:", columns); // Debug

  const columnKeyMap: Record<ColumnName, DataKey> = {
    Title: "title",
    "Posted Date": "posteddate",
    Applications: "applications",
    Name: "name",
    Job: "job",
    Status: "status",
    "Admin Email": "adminEmail",
  };

  if (!columns) {
    return <div>Error: Columns not provided</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center">
              No data available
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column}>
                  {(row as any)[columnKeyMap[column]] ?? "N/A"}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
