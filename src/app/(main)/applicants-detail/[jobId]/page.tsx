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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FilterIcon,
  SearchIcon,
  Loader2,
  BriefcaseIcon,
  UserIcon,
  MailIcon,
  GraduationCapIcon,
  CalendarIcon,
  CheckCircleIcon,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const careerLevels = [
    "Senior Executive(C Level)",
    "Executive(VP, Director)",
    "Senior(5-8 years)",
    "Mid Level(3-5 years)",
    "Junior Level(1-3 years)",
  ];

  const updateApplicationStatus = async (applicationId: string) => {
    try {
      const response = await fetch(
        `/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Reviewed" }),
        }
      );

      if (!response.ok) throw new Error("Failed to update application status");

      setFilteredApplicants((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: "Reviewed" } : app
        )
      );

      toast.success("Status Updated", {
        description: "Applicant status has been updated to Reviewed.",
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
    if (careerLevelFilter) {
      applicants = applicants.filter(
        (app) => app.careerLevel === careerLevelFilter
      );
    }
    if (degreeTypeFilter) {
      applicants = applicants.filter(
        (app) => app.degreeType.toLowerCase() === degreeTypeFilter.toLowerCase()
      );
    }
    setFilteredApplicants(applicants);
  }, [job, searchQuery, careerLevelFilter, degreeTypeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-6">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="outline"
              className="bg-green-600 text-white hover:bg-green-700 hover:text-white mr-4"
              onClick={() => router.push("/dashboard/company")}
            >
              <BsArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-green-800 flex items-center">
              <BriefcaseIcon className="h-8 w-8 mr-3 text-green-600" />
              Applicants for {job?.title || "Job"}
            </h1>
          </div>
        </header>

        <Card className="w-full shadow-lg hover:shadow-xl transition-shadow border border-green-100">
          <CardHeader className="bg-green-50 rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold text-green-800 flex items-center p-3">
                <UserIcon className="h-5 w-5 mr-2" />
                Applicants {filteredApplicants.length}
              </CardTitle>
              <div className="flex items-center space-x-2">
                {filteredApplicants.length > 0 && (
                  <div className="text-green-800">
                    Showing {filteredApplicants.length} of{" "}
                    {job?.applications.length}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 mb-6">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-white hover:bg-gray-50"
                    >
                      <FilterIcon className="h-4 w-4 text-green-600" />
                      <span>Career Level</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    <DropdownMenuLabel className="flex items-center">
                      <BriefcaseIcon className="h-4 w-4 mr-2" />
                      Career Level
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setCareerLevelFilter(null)}
                      className="flex items-center"
                    >
                      <span className="mr-2">All</span>
                    </DropdownMenuItem>
                    {careerLevels.map((level) => (
                      <DropdownMenuItem
                        key={level}
                        onClick={() => setCareerLevelFilter(level)}
                        className="flex items-center"
                      >
                        <span className="mr-2 truncate">{level}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-white hover:bg-gray-50"
                    >
                      <FilterIcon className="h-4 w-4 text-green-600" />
                      <span>Degree Type</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
                    <DropdownMenuLabel className="flex items-center">
                      <GraduationCapIcon className="h-4 w-4 mr-2" />
                      Degree Type
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDegreeTypeFilter(null)}
                      className="flex items-center"
                    >
                      <span className="mr-2">All</span>
                    </DropdownMenuItem>
                    {Array.from(
                      new Set(
                        job?.applications?.map((app) => app.degreeType) || []
                      )
                    ).map((degreeType) => (
                      <DropdownMenuItem
                        key={degreeType}
                        onClick={() => setDegreeTypeFilter(degreeType)}
                        className="flex items-center"
                      >
                        <span className="mr-2 truncate">{degreeType}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {filteredApplicants.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <UserIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No applicants found
                </h3>
                <p className="mt-2 text-gray-500">
                  {searchQuery || careerLevelFilter || degreeTypeFilter
                    ? "Try adjusting your filters or search query"
                    : "No applicants have applied for this position yet"}
                </p>
                <Button
                  variant="ghost"
                  className="mt-4 text-green-600 hover:text-green-700"
                  onClick={() => {
                    setSearchQuery("");
                    setCareerLevelFilter(null);
                    setDegreeTypeFilter(null);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="w-full rounded-lg border border-gray-200 overflow-hidden">
                <Table className="min-w-full table-auto">
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="min-w-[100px]">
                        <span className="inline-flex items-center">
                          <UserIcon className="h-4 w-4 mr-2 text-green-600" />
                          Name
                        </span>
                      </TableHead>
                      <TableHead>
                        <span className="inline-flex items-center">
                          <MailIcon className="h-4 w-4 mr-2 text-green-600" />
                          Email
                        </span>
                      </TableHead>
                      <TableHead>
                        <span className="inline-flex items-center">
                          <BriefcaseIcon className="h-4 w-4 mr-2 text-green-600" />
                          Career Level
                        </span>
                      </TableHead>
                      <TableHead>
                        <span className="inline-flex items-center">
                          <GraduationCapIcon className="h-4 w-4 mr-2 text-green-600" />
                          Degree
                        </span>
                      </TableHead>
                      <TableHead>
                        <span className="inline-flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 text-green-600" />
                          Applied On
                        </span>
                      </TableHead>
                      <TableHead>
                        <span className="inline-flex items-center">
                          <CheckCircleIcon className="h-4 w-4 mr-2 text-green-600" />
                          Status
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplicants.map((applicant) => (
                      <TableRow
                        key={applicant.id}
                        className="cursor-pointer hover:bg-green-50"
                        onClick={() => {
                          if (applicant.status !== "Reviewed") {
                            updateApplicationStatus(applicant.id);
                          }
                          router.push(
                            `/applicant/${applicant.id}?jobId=${jobId}`
                          );
                        }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                              <UserIcon className="h-4 w-4 text-green-600" />
                            </div>
                            {applicant.fullName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${applicant.email}`}
                            className="text-blue-600 hover:underline flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {applicant.email}
                          </a>
                        </TableCell>
                        <TableCell>
                          <div className="bg-purple-50 text-purple-800 border-purpl-200 p-1 rounded-md">
                            {applicant.careerLevel}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="bg-green-50 text-green-800 border-green-200 p-1 rounded-md">
                            {applicant.degreeType}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                            {new Date(applicant.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {applicant.status === "Reviewed" ? (
                            <div className="text-green-800 flex items-center">
                              Reviewed
                            </div>
                          ) : (
                            <div className="text-gray-600">Pending</div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
