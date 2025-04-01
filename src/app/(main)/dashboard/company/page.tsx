"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterIcon, SearchIcon } from "lucide-react";

interface Job {
  id: string;
  title: string;
  area: string;
  location: string;
  deadline: string;
  applications: Application[];
}

interface Application {
  id: string;
  fullName: string;
  email: string;
  careerLevel: string;
  skills: string[];
  degreeType: string;
  certifications: string[];
  languages: string[];
  createdAt: string;
}

export default function CompanyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filteredApplicants, setFilteredApplicants] = useState<Application[]>(
    []
  );
  const [companyName, setCompanyName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [careerLevelFilter, setCareerLevelFilter] = useState<string | null>(
    null
  );
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const careerLevels = [
    "Senior Executive(C Level)",
    "Executive(VP, Director)",
    "Senior(5-8 years)",
    "Mid Level(3-5 years)",
    "Junior Level(1-3 years)",
  ];

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "COMPANY_ADMIN") {
      router.push("/login");
      return;
    }

    console.log("Session User ID:", session.user.id); // Debug

    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/company-jobs");
        if (!response.ok) {
          throw new Error(`Failed to fetch jobs: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("API Response:", data); // Debug: Log full response

        setCompanyName(data.companyName || "Unknown Company");
        const validJobs = Array.isArray(data.jobs)
          ? data.jobs.map((job: Job) => ({
              ...job,
              applications: job.applications || [],
            }))
          : [];
        setJobs(validJobs);
        setSelectedJob(validJobs[0] || null);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Failed to load jobs for your company");
        setJobs([]);
        setSelectedJob(null);
        setCompanyName("Unknown Company");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [session, status, router]);

  useEffect(() => {
    if (!selectedJob || !selectedJob.applications) {
      setFilteredApplicants([]);
      return;
    }

    let applicants = selectedJob.applications;
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
    if (skillFilter) {
      applicants = applicants.filter((app) =>
        app.skills.some(
          (skill) => skill.toLowerCase() === skillFilter.toLowerCase()
        )
      );
    }
    setFilteredApplicants(applicants);
  }, [selectedJob, searchQuery, careerLevelFilter, skillFilter]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
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
  const handleLogout = async () => {
    await signOut({ redirect: false }); // Sign out without immediate redirect
    router.push("/login"); // Manually redirect to login page
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-300 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-green-700">
            {companyName} Dashboard
          </h1>
          <div className="flex space-x-4 px-8">
            <Button
              variant="outline"
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => router.push("/jobs/company-job-form")}
            >
              Post New Job
            </Button>
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={handleLogout} // Add logout handler
            >
              Logout
            </Button>
          </div>
        </header>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="jobs">Posted Jobs</TabsTrigger>
            <TabsTrigger value="applicants">Applicants</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-green-700">
                  Posted Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No jobs posted yet by {companyName}.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Applicants</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>{job.title}</TableCell>
                          <TableCell>{job.area}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>
                            {new Date(job.deadline).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{job.applications.length}</TableCell>
                          <TableCell>
                            <Button
                              variant="link"
                              onClick={() => setSelectedJob(job)}
                            >
                              View Applicants
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applicants">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-green-700">
                  Applicants for {selectedJob?.title || "No Job Selected"} (
                  {filteredApplicants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <FilterIcon className="h-4 w-4" />
                        Filter by Career Level
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Career Level</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setCareerLevelFilter(null)}
                      >
                        All
                      </DropdownMenuItem>
                      {careerLevels.map((level) => (
                        <DropdownMenuItem
                          key={level}
                          onClick={() => setCareerLevelFilter(level)}
                        >
                          {level}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <FilterIcon className="h-4 w-4" />
                        Filter by Skill
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Skills</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSkillFilter(null)}>
                        All
                      </DropdownMenuItem>
                      {Array.from(
                        new Set(
                          selectedJob?.applications?.flatMap(
                            (app) => app.skills
                          ) || []
                        )
                      ).map((skill) => (
                        <DropdownMenuItem
                          key={skill}
                          onClick={() => setSkillFilter(skill)}
                        >
                          {skill}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {selectedJob ? (
                  filteredApplicants.length === 0 ? (
                    <p className="text-center text-gray-500 mt-4">
                      No applicants match the current filters.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Career Level</TableHead>
                          <TableHead>Skills</TableHead>
                          <TableHead>Degree</TableHead>
                          <TableHead>Applied On</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplicants.map((applicant) => (
                          <TableRow key={applicant.id}>
                            <TableCell>{applicant.fullName}</TableCell>
                            <TableCell>{applicant.email}</TableCell>
                            <TableCell>{applicant.careerLevel}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {applicant.skills.map((skill, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>{applicant.degreeType}</TableCell>
                            <TableCell>
                              {new Date(
                                applicant.createdAt
                              ).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )
                ) : (
                  <p className="text-center text-gray-500 mt-4">
                    Please select a job to view applicants.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
