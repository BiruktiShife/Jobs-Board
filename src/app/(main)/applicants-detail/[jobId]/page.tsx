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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FilterIcon, SearchIcon, ChevronDownIcon, Loader2 } from "lucide-react";
import { BsArrowLeft } from "react-icons/bs";

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
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] =
    useState<Application | null>(null);

  const careerLevels = [
    "Senior Executive(C Level)",
    "Executive(VP, Director)",
    "Senior(5-8 years)",
    "Mid Level(3-5 years)",
    "Junior Level(1-3 years)",
  ];

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`/api/company-jobs/${jobId}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch job details: ${response.statusText}`
          );
        }
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
    if (skillFilter) {
      applicants = applicants.filter((app) =>
        app.skills.some(
          (skill) => skill.toLowerCase() === skillFilter.toLowerCase()
        )
      );
    }
    setFilteredApplicants(applicants);
  }, [job, searchQuery, careerLevelFilter, skillFilter]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-300 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-green-700">
            <Button
              variant="outline"
              className="bg-green-600 text-white hover:bg-green-700 hover:text-white mr-6"
              onClick={() => router.push("/dashboard/company")}
            >
              <BsArrowLeft />
            </Button>
            Applicants for {job?.title || "Job"}
          </h1>
        </header>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-green-700">
              Applicants ({filteredApplicants.length})
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
                  <Button variant="outline" className="flex items-center gap-2">
                    <FilterIcon className="h-4 w-4" />
                    Filter by Career Level
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Career Level</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCareerLevelFilter(null)}>
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
                  <Button variant="outline" className="flex items-center gap-2">
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
                      job?.applications?.flatMap((app) => app.skills) || []
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

            {filteredApplicants.length === 0 ? (
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
                    <TableHead>Certifications</TableHead>
                    <TableHead>Languages</TableHead>
                    <TableHead>Applied On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplicants.map((applicant) => (
                    <Dialog key={applicant.id}>
                      <DialogTrigger asChild>
                        <TableRow
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => setSelectedApplicant(applicant)}
                        >
                          <TableCell>{applicant.fullName}</TableCell>
                          <TableCell>{applicant.email}</TableCell>
                          <TableCell>{applicant.careerLevel}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="flex items-center gap-1"
                                >
                                  {applicant.skills.length} Skill(s)
                                  <ChevronDownIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel>Skills</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {applicant.skills.length > 0 ? (
                                  applicant.skills.map((skill, idx) => (
                                    <DropdownMenuItem key={idx}>
                                      {skill}
                                    </DropdownMenuItem>
                                  ))
                                ) : (
                                  <DropdownMenuItem>
                                    No skills listed
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell>{applicant.degreeType}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="flex items-center gap-1"
                                >
                                  {applicant.certifications.length} Cert(s)
                                  <ChevronDownIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel>
                                  Certifications
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {applicant.certifications.length > 0 ? (
                                  applicant.certifications.map((cert, idx) => (
                                    <DropdownMenuItem key={idx}>
                                      {cert}
                                    </DropdownMenuItem>
                                  ))
                                ) : (
                                  <DropdownMenuItem>
                                    No certifications listed
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="flex items-center gap-1"
                                >
                                  {applicant.languages.length} Lang(s)
                                  <ChevronDownIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel>Languages</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {applicant.languages.length > 0 ? (
                                  applicant.languages.map((lang, idx) => (
                                    <DropdownMenuItem key={idx}>
                                      {lang}
                                    </DropdownMenuItem>
                                  ))
                                ) : (
                                  <DropdownMenuItem>
                                    No languages listed
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell>
                            {new Date(applicant.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader className="z-10 pb-4 border-b">
                          <DialogTitle>
                            {selectedApplicant?.fullName} - Application Details
                          </DialogTitle>
                        </DialogHeader>
                        {selectedApplicant && (
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold">Email</h3>
                              <p>{selectedApplicant.email}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Year of Birth</h3>
                              <p>{selectedApplicant.yearOfBirth}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Address</h3>
                              <p>{selectedApplicant.address}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Phone</h3>
                              <p>{selectedApplicant.phone}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Portfolio</h3>
                              <p>
                                {selectedApplicant.portfolio || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Profession</h3>
                              <p>{selectedApplicant.profession}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Career Level</h3>
                              <p>{selectedApplicant.careerLevel}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Cover Letter</h3>
                              <p className="whitespace-pre-wrap">
                                {selectedApplicant.coverLetter}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Experiences</h3>
                              {selectedApplicant.experiences.length > 0 ? (
                                <ul className="list-disc pl-5">
                                  {selectedApplicant.experiences.map(
                                    (exp, idx) => (
                                      <li key={idx}>
                                        <strong>{exp.jobTitle}</strong> at{" "}
                                        {exp.company_name} ({exp.location}) -{" "}
                                        {exp.responsibilities}
                                      </li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                <p>No experiences listed</p>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold">Education</h3>
                              <p>
                                {selectedApplicant.degreeType} from{" "}
                                {selectedApplicant.institution} (
                                {new Date(
                                  selectedApplicant.graduationDate
                                ).toLocaleDateString()}
                                )
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Skills</h3>
                              <p>
                                {selectedApplicant.skills.join(", ") || "None"}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Certifications</h3>
                              <p>
                                {selectedApplicant.certifications.join(", ") ||
                                  "None"}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Languages</h3>
                              <p>
                                {selectedApplicant.languages.join(", ") ||
                                  "None"}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Projects</h3>
                              <p>
                                {selectedApplicant.projects || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Volunteer Work</h3>
                              <p>
                                {selectedApplicant.volunteerWork ||
                                  "Not provided"}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Resume URL</h3>
                              <p>
                                {selectedApplicant.resumeUrl ? (
                                  <a
                                    href={selectedApplicant.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    View Resume
                                  </a>
                                ) : (
                                  "Not provided"
                                )}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Status</h3>
                              <p>{selectedApplicant.status || "Pending"}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Applied On</h3>
                              <p>
                                {new Date(
                                  selectedApplicant.createdAt
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
