"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ChartVisitorsProps {
  data: {
    id: string;
    title: string;
    company: string;
    postedDate: string;
    fill: string;
  }[];
}

export function ChartVisitors({ data }: ChartVisitorsProps) {
  // Sort data by postedDate in descending order (most recent first)
  const sortedData = React.useMemo(() => {
    return [...data]
      .sort((a, b) => {
        return (
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );
      })
      .slice(0, 5); // Take only the 5 most recent jobs
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardDescription className="text-green-700">
          Five Recently Posted Jobs
        </CardDescription>
        <CardTitle className="text-2xl font-bold text-green-600">
          Recent Job Postings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Posted Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell>
                  {new Date(job.postedDate).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
