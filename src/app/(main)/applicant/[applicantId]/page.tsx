"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BriefcaseIcon,
  UserIcon,
  MailIcon,
  GraduationCapIcon,
  FileTextIcon,
  CodeIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  ClockIcon,
  Loader2,
} from "lucide-react";
import { BsArrowLeft } from "react-icons/bs";
import Link from "next/link";

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

export default function ApplicantDetailPage() {
  const router = useRouter();
  const { applicantId } = useParams();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const [applicant, setApplicant] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getResumeUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith("https://gateway.pinata.cloud/ipfs/")) {
      const cid = url.split("/ipfs/")[1];
      return `https://silver-accepted-barracuda-955.mypinata.cloud/ipfs/${cid}`;
    }
    return url;
  };

  useEffect(() => {
    const fetchApplicantDetails = async () => {
      if (!jobId) {
        setError("Job ID not provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/company-jobs/${jobId}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch job details: ${response.statusText}`
          );
        }
        const data = await response.json();
        const applicant = data.applications?.find(
          (app: Application) => app.id === applicantId
        );
        if (!applicant) {
          throw new Error("Applicant not found in job applications");
        }
        setApplicant(applicant);
      } catch (error) {
        console.error("Error fetching applicant details:", error);
        setError("Failed to load applicant details");
      } finally {
        setLoading(false);
      }
    };
    fetchApplicantDetails();
  }, [applicantId, jobId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-600">
        <h2 className="text-xl font-semibold">
          {error || "Applicant not found"}
        </h2>
        <Button
          variant="outline"
          className="mt-4 bg-green-600 text-white hover:bg-green-700 hover:text-white"
          onClick={() => router.push(`/applicants-detail/${jobId}`)}
        >
          <BsArrowLeft className="h-5 w-5 mr-2" />
          Back to Applicants
        </Button>
      </div>
    );
  }

  const resumeUrl = getResumeUrl(applicant.resumeUrl || "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="outline"
              className="bg-green-600 text-white hover:bg-green-700 hover:text-white mr-4"
              onClick={() => router.push(`/applicants-detail/${jobId}`)}
            >
              <BsArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl sm:text-1xl font-bold text-green-800 flex items-center">
              <UserIcon className="h-8 w-8 mr-3 text-green-600" />
              {applicant.fullName}
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="w-full shadow-lg border border-green-100 overflow-y-auto">
            <CardHeader className="bg-green-50 rounded-t-lg">
              <CardTitle className="text-xl font-semibold text-green-800 flex items-center p-3">
                <UserIcon className="h-5 w-5 mr-2" />
                Applicant Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 flex items-center mb-2">
                        <UserIcon className="h-5 w-5 mr-2" />
                        Personal Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="flex items-center">
                            <MailIcon className="h-4 w-4 mr-2 text-gray-500" />
                            {applicant.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Year of Birth</p>
                          <p>{applicant.yearOfBirth}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p>{applicant.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p>{applicant.address}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Portfolio</p>
                          <p>
                            {applicant.portfolio ? (
                              <Link
                                href={applicant.portfolio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center"
                              >
                                <ExternalLinkIcon className="h-4 w-4 mr-1" />
                                View Portfolio
                              </Link>
                            ) : (
                              <span className="text-gray-500 italic">
                                Not provided
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-800 flex items-center mb-2">
                        <BriefcaseIcon className="h-5 w-5 mr-2" />
                        Professional Information
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Profession</p>
                          <p>{applicant.profession}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Career Level</p>
                          <p>{applicant.careerLevel}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Skills</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {applicant.skills.length > 0 ? (
                              applicant.skills.map((skill, idx) => (
                                <div key={idx} className=" text-yellow-800 ">
                                  {skill}
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-500 italic">None</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-800 flex items-center mb-2">
                        <GraduationCapIcon className="h-5 w-5 mr-2" />
                        Education
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Degree</p>
                          <p>{applicant.degreeType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Institution</p>
                          <p>{applicant.institution}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Graduation Date
                          </p>
                          <p>
                            {new Date(
                              applicant.graduationDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Certifications
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {applicant.certifications.length > 0 ? (
                              applicant.certifications.map((cert, idx) => (
                                <div key={idx} className=" text-green-800 ">
                                  {cert}
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-500 italic">None</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Languages</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {applicant.languages.length > 0 ? (
                              applicant.languages.map((lang, idx) => (
                                <div key={idx} className=" text-green-800 ">
                                  {lang}
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-500 italic">None</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-yellow-800 flex items-center mb-2">
                        <FileTextIcon className="h-5 w-5 mr-2" />
                        Application Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <div>
                            {applicant.status === "Accepted" ? (
                              <div className="flex items-center  text-green-600 ">
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Accepted
                              </div>
                            ) : applicant.status === "Rejected" ? (
                              <div className="flex items-center  text-red-600 ">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                Rejected
                              </div>
                            ) : applicant.status === "Reviewed" ? (
                              <div className="flex items-center  text-blue-600 ">
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Reviewed
                              </div>
                            ) : (
                              <div className="flex items-center  text-gray-600">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                Pending
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Applied On</p>
                          <p>
                            {new Date(applicant.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 flex items-center mb-2">
                    <BriefcaseIcon className="h-5 w-5 mr-2" />
                    Work Experience
                  </h3>
                  {applicant.experiences.length > 0 ? (
                    <div className="space-y-4">
                      {applicant.experiences.map((exp, idx) => (
                        <div
                          key={idx}
                          className="border-l-4 border-green-500 pl-4 py-2"
                        >
                          <h4 className="font-medium">{exp.jobTitle}</h4>
                          <p className="text-sm text-gray-600">
                            {exp.company_name} • {exp.location}
                          </p>
                          <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                            {exp.responsibilities}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No experiences listed</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 flex items-center mb-2">
                    <FileTextIcon className="h-5 w-5 mr-2" />
                    Cover Letter
                  </h3>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">
                      {applicant.coverLetter}
                    </p>
                  </div>
                </div>

                {applicant.projects && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 flex items-center mb-2">
                      <CodeIcon className="h-5 w-5 mr-2" />
                      Projects
                    </h3>
                    <p className="whitespace-pre-wrap">{applicant.projects}</p>
                  </div>
                )}

                {applicant.volunteerWork && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 flex items-center mb-2">
                      <UserIcon className="h-5 w-5 mr-2" />
                      Volunteer Work
                    </h3>
                    <p className="whitespace-pre-wrap">
                      {applicant.volunteerWork}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="w-full">
            <CardTitle className="text-xl font-semibold text-green-800 flex items-center p-3">
              <FileTextIcon className="h-5 w-5 mr-2" />
              Resume
            </CardTitle>
            {resumeUrl ? (
              <iframe
                src={resumeUrl}
                className="w-full h-[calc(150vh-170px)] border-0"
                title="Resume PDF"
              />
            ) : (
              <div className="flex items-center justify-center h-[calc(80vh-100px)] text-gray-500 italic">
                No resume provided
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
