"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  AwardIcon,
  LanguagesIcon,
  HeartHandshakeIcon,
  DownloadIcon,
  StarIcon,
  BuildingIcon,
} from "lucide-react";
import { ArrowLeft } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 absolute top-4 left-4" />
          </div>
          <p className="mt-4 text-slate-600 font-medium">
            Loading applicant details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {error || "Applicant not found"}
          </h2>
          <p className="text-slate-600 mb-6">
            We couldn't find the applicant details you're looking for.
          </p>
          <Button
            onClick={() => router.push(`/applicants-detail/${jobId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applicants
          </Button>
        </div>
      </div>
    );
  }

  const resumeUrl = getResumeUrl(applicant.resumeUrl || "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.push(`/applicants-detail/${jobId}`)}
              className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applicants
            </Button>
          </div>

          {/* Applicant Header Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <UserIcon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                      {applicant.fullName}
                    </h1>
                    <p className="text-xl text-slate-600 mb-1">
                      {applicant.profession}
                    </p>
                    <p className="text-slate-500">{applicant.careerLevel}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2">
                    {applicant.status === "Accepted" ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Accepted
                      </Badge>
                    ) : applicant.status === "Rejected" ? (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        Rejected
                      </Badge>
                    ) : applicant.status === "Reviewed" ? (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Reviewed
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>

                  {resumeUrl && (
                    <Button
                      asChild
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Link
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download Resume
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Personal & Professional Info */}
          <div className="xl:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <MailIcon className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">
                        {applicant.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <PhoneIcon className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="font-medium text-slate-900">
                        {applicant.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Year of Birth</p>
                      <p className="font-medium text-slate-900">
                        {applicant.yearOfBirth}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <MapPinIcon className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="font-medium text-slate-900">
                        {applicant.address}
                      </p>
                    </div>
                  </div>
                </div>

                {applicant.portfolio && (
                  <div className="mt-4">
                    <Button asChild variant="outline" className="w-full">
                      <Link
                        href={applicant.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLinkIcon className="w-4 h-4 mr-2" />
                        View Portfolio
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <GraduationCapIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <AwardIcon className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Degree</p>
                      <p className="font-medium text-slate-900">
                        {applicant.degreeType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <BuildingIcon className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Institution</p>
                      <p className="font-medium text-slate-900">
                        {applicant.institution}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg md:col-span-2">
                    <CalendarIcon className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-500">Graduation Date</p>
                      <p className="font-medium text-slate-900">
                        {new Date(
                          applicant.graduationDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Qualifications */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <StarIcon className="w-4 h-4 text-green-600" />
                  </div>
                  Skills & Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Skills */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <CodeIcon className="w-4 h-4" />
                    Technical Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {applicant.skills.length > 0 ? (
                      applicant.skills.map((skill, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">
                        No skills listed
                      </span>
                    )}
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <AwardIcon className="w-4 h-4" />
                    Certifications
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {applicant.certifications.length > 0 ? (
                      applicant.certifications.map((cert, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-green-100 text-green-800 hover:bg-green-100"
                        >
                          {cert}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">
                        No certifications listed
                      </span>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <LanguagesIcon className="w-4 h-4" />
                    Languages
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {applicant.languages.length > 0 ? (
                      applicant.languages.map((lang, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-purple-100 text-purple-800 hover:bg-purple-100"
                        >
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">
                        No languages listed
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Experience & Additional Info */}
          <div className="space-y-6">
            {/* Work Experience */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BriefcaseIcon className="w-4 h-4 text-orange-600" />
                  </div>
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {applicant.experiences.length > 0 ? (
                  applicant.experiences.map((exp, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">
                          {exp.jobTitle}
                        </h4>
                      </div>
                      <p className="font-medium text-slate-700 mb-1">
                        {exp.company_name}
                      </p>
                      <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3" />
                        {exp.location}
                      </p>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {exp.responsibilities}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BriefcaseIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      No work experience provided
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cover Letter */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileTextIcon className="w-4 h-4 text-indigo-600" />
                  </div>
                  Cover Letter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {applicant.coverLetter}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            {(applicant.projects || applicant.volunteerWork) && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                      <HeartHandshakeIcon className="w-4 h-4 text-teal-600" />
                    </div>
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {applicant.projects && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">
                        Notable Projects
                      </h4>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                          {applicant.projects}
                        </p>
                      </div>
                    </div>
                  )}

                  {applicant.volunteerWork && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">
                        Volunteer Work
                      </h4>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                          {applicant.volunteerWork}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Application Timeline */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-4 h-4 text-amber-600" />
                  </div>
                  Application Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Applied on</p>
                    <p className="font-medium text-slate-900">
                      {new Date(applicant.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">
                      Current Status
                    </p>
                    {applicant.status === "Accepted" ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Accepted
                      </Badge>
                    ) : applicant.status === "Rejected" ? (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        Rejected
                      </Badge>
                    ) : applicant.status === "Reviewed" ? (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Reviewed
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        Pending Review
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Resume Viewer Section */}
        {resumeUrl && (
          <div className="mt-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileTextIcon className="w-4 h-4 text-red-600" />
                  </div>
                  Resume Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-slate-50 rounded-lg overflow-hidden">
                  <iframe
                    src={resumeUrl}
                    className="w-full h-[800px] border-0"
                    title="Resume PDF Preview"
                    style={{ minHeight: "800px" }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
