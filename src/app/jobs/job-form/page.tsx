"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BsArrowLeft } from "react-icons/bs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Building,
  MapPin,
  Calendar,
  Clock,
  Target,
  FileText,
  Briefcase,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface Job {
  id: string; // Made id required
  title: string;
  companyId: string;
  logo: string;
  area: string;
  location: string;
  deadline: string;
  site: "Full_time" | "Part_time" | "Freelance";
  qualifications: string[];
  responsibilities: string[];
  about_job: string;
  requiredSkills: string[];
}

interface JobFormProps {
  onSubmit: (job: Job, isEdit: boolean) => void;
  companies: { id: string; name: string; logo: string }[];
  initialJob?: Job;
  jobId?: string; // Added to pass jobId explicitly
}

function JobForm({ onSubmit, companies, initialJob, jobId }: JobFormProps) {
  const router = useRouter();
  const [job, setJob] = useState<Job>(
    initialJob || {
      id: jobId || "",
      title: "",
      companyId: companies[0]?.id || "",
      logo: companies[0]?.logo || "",
      area: "",
      location: "",
      deadline: "",
      site: "Full_time",
      qualifications: [""],
      responsibilities: [""],
      about_job: "",
      requiredSkills: [""],
    }
  );
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const isReviewMode = searchParams.get("mode") === "review";

  useEffect(() => {
    if (id && !initialJob) {
      fetch(`/api/jobs/${id}`)
        .then((res) => res.json())
        .then((data) => setJob({ ...data, id })) // Ensure id is set
        .catch((err) => console.error(err));
    }
  }, [id, initialJob]);

  const handleCompanyChange = (companyId: string) => {
    const selectedCompany = companies.find((c) => c.id === companyId);
    setJob((prev) => ({
      ...prev,
      companyId,
      logo: selectedCompany?.logo || "",
    }));
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setJob({ ...job, [name]: value });
  };

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJob({ ...job, about_job: e.target.value });
  };

  const addField = (field: keyof Job) => {
    if (Array.isArray(job[field])) {
      setJob((prev) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), ""],
      }));
    }
  };

  const removeField = (field: keyof Job, index: number) => {
    if (Array.isArray(job[field])) {
      setJob((prev) => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    // Ensure id is included in job data
    onSubmit({ ...job, id: job.id || id || "" }, !!id || !!initialJob);
  };

  const industryOptions = [
    "Programming",
    "Business",
    "Healthcare",
    "Education",
    "Design",
    "Finance",
    "Engineering",
    "Sales",
    "Marketing",
    "Data Science",
    "Human Resources",
    "Product Management",
    "Operations",
    "Logistics",
    "Research",
    "Customer Support",
  ];

  const handleApproveJob = async () => {
    if (!id) {
      toast.error("Job ID not found");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/jobs/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "APPROVED" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve job");
      }

      toast.success("Job approved successfully", {
        description:
          "The job has been approved and will be visible to job seekers.",
      });

      // Wait a moment for the toast to be visible before redirecting
      setTimeout(() => {
        router.replace("/admin?tab=pending-jobs");
      }, 1500);
    } catch (error) {
      console.error("Error approving job:", error);
      toast.error("Failed to approve job", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while approving the job",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectJob = async () => {
    if (!id) {
      toast.error("Job ID not found");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/jobs/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "REJECTED" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reject job");
      }

      toast.success("Job rejected", {
        description:
          "The job has been rejected and will not be visible to job seekers.",
      });

      // Wait a moment for the toast to be visible before redirecting
      setTimeout(() => {
        router.replace("/admin?tab=pending-jobs");
      }, 1500);
    } catch (error) {
      console.error("Error rejecting job:", error);
      toast.error("Failed to reject job", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while rejecting the job",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-4 sm:py-8">
      <div className="w-full sm:max-w-5xl mx-auto px-4">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="mr-4 text-indigo-600 hover:bg-indigo-100 hover:scale-105 transition-all duration-200"
              asChild
            >
              <Link href="/admin">
                <BsArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {isReviewMode
                      ? "Review Job Posting"
                      : initialJob || id
                        ? "Edit Job Posting"
                        : "Create Job Posting"}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {isReviewMode
                      ? "Review and approve this job posting"
                      : "Share your opportunity with talented professionals"}
                  </p>
                </div>
              </div>

              {/* Status Badge for Review Mode */}
              {isReviewMode && (
                <div className="flex items-center gap-2 mt-3">
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Review
                  </Badge>
                  <span className="text-sm text-gray-500">
                    This job posting is awaiting admin approval
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-xl border-b border-indigo-100 p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-indigo-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                Job Details
              </CardTitle>

              {/* Action Buttons for Review Mode */}
              {isReviewMode && (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleApproveJob}
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Approve Job
                  </Button>
                  <Button
                    onClick={handleRejectJob}
                    variant="destructive"
                    className="shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Reject Job
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center shadow-sm">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Error</h4>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {/* Enhanced Progress Indicator */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center bg-white rounded-2xl p-2 shadow-lg border border-indigo-100">
                  <div
                    className={`flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      step === 1
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                        step === 1 ? "bg-white/20" : "bg-indigo-200"
                      }`}
                    >
                      {step > 1 ? (
                        <CheckCircle className="h-4 w-4 text-indigo-600" />
                      ) : (
                        <span
                          className={`text-xs font-bold ${step === 1 ? "text-white" : "text-indigo-600"}`}
                        >
                          1
                        </span>
                      )}
                    </div>
                    <span>Basic Information</span>
                  </div>

                  <div className="w-12 h-px bg-gradient-to-r from-indigo-200 to-purple-200 mx-2"></div>

                  <div
                    className={`flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      step === 2
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                        step === 2 ? "bg-white/20" : "bg-indigo-200"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold ${step === 2 ? "text-white" : "text-indigo-600"}`}
                      >
                        2
                      </span>
                    </div>
                    <span>Job Details</span>
                  </div>
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-8">
                  {/* Job Title Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">
                          Job Title
                        </h3>
                        <p className="text-sm text-blue-600">
                          What position are you hiring for?
                        </p>
                      </div>
                    </div>
                    <Input
                      id="title"
                      name="title"
                      value={job.title}
                      onChange={(e) => handleInput(e)}
                      required
                      readOnly={isReviewMode}
                      placeholder="e.g. Senior Software Engineer, Marketing Manager"
                      className={`text-lg font-medium ${isReviewMode ? "bg-gray-100" : "bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400"}`}
                    />
                  </div>

                  {/* Company Selection */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Building className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-purple-900">
                          Company
                        </h3>
                        <p className="text-sm text-purple-600">
                          Select the hiring company
                        </p>
                      </div>
                    </div>
                    <Select
                      onValueChange={handleCompanyChange}
                      value={job.companyId}
                      required
                      disabled={isReviewMode}
                    >
                      <SelectTrigger className="bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400 h-12">
                        <SelectValue placeholder="Choose a company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {companies.map((company) => (
                            <SelectItem
                              key={company.id}
                              value={company.id}
                              className="hover:bg-purple-50 py-3"
                            >
                              <div className="flex items-center gap-3">
                                {company.logo ? (
                                  <Image
                                    src={company.logo}
                                    alt={company.name}
                                    width={24}
                                    height={24}
                                    className="rounded-md"
                                  />
                                ) : (
                                  <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                                    <Building className="w-3 h-3 text-purple-600" />
                                  </div>
                                )}
                                <span className="font-medium">
                                  {company.name}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Industry & Location Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Industry Selection */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <Target className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-900">
                            Industry
                          </h3>
                          <p className="text-sm text-green-600">Job category</p>
                        </div>
                      </div>
                      <Select
                        name="area"
                        value={job.area}
                        onValueChange={(value) =>
                          handleInput({
                            target: { name: "area", value },
                          } as React.ChangeEvent<HTMLSelectElement>)
                        }
                        disabled={isReviewMode}
                      >
                        <SelectTrigger className="bg-white border-green-200 focus:border-green-400 focus:ring-green-400 h-12">
                          <SelectValue placeholder="Choose industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {industryOptions.map((option) => (
                              <SelectItem
                                key={option}
                                value={option}
                                className="hover:bg-green-50 py-3"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  <span>{option}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location */}
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-orange-900">
                            Location
                          </h3>
                          <p className="text-sm text-orange-600">
                            Where is this job based?
                          </p>
                        </div>
                      </div>
                      <Input
                        id="location"
                        name="location"
                        value={job.location}
                        onChange={(e) => handleInput(e)}
                        required
                        readOnly={isReviewMode}
                        placeholder="e.g. New York, NY or Remote"
                        className={`bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400 h-12 ${isReviewMode ? "bg-gray-100" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Deadline & Employment Type Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Application Deadline */}
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-teal-900">
                            Application Deadline
                          </h3>
                          <p className="text-sm text-teal-600">
                            When should applications close?
                          </p>
                        </div>
                      </div>
                      <Input
                        type="date"
                        id="deadline"
                        name="deadline"
                        value={job.deadline}
                        onChange={(e) => handleInput(e)}
                        required
                        readOnly={isReviewMode}
                        className={`bg-white border-teal-200 focus:border-teal-400 focus:ring-teal-400 h-12 ${isReviewMode ? "bg-gray-100" : ""}`}
                      />
                    </div>

                    {/* Employment Type */}
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                          <Clock className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-rose-900">
                            Employment Type
                          </h3>
                          <p className="text-sm text-rose-600">
                            Full-time, part-time, or freelance?
                          </p>
                        </div>
                      </div>
                      <Select
                        name="site"
                        value={job.site}
                        onValueChange={(value) =>
                          handleInput({
                            target: { name: "site", value },
                          } as React.ChangeEvent<HTMLInputElement>)
                        }
                        disabled={isReviewMode}
                      >
                        <SelectTrigger className="bg-white border-rose-200 focus:border-rose-400 focus:ring-rose-400 h-12">
                          <SelectValue placeholder="Select Employment Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem
                              value="Full_time"
                              className="hover:bg-rose-50 py-3"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                                <span>Full-time</span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="Part_time"
                              className="hover:bg-rose-50 py-3"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                                <span>Part-time</span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="Freelance"
                              className="hover:bg-rose-50 py-3"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                                <span>Freelance</span>
                              </div>
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Job Description
                        </h3>
                        <p className="text-sm text-slate-600">
                          Describe the role and what you&apos;re looking for
                        </p>
                      </div>
                    </div>
                    <Textarea
                      id="about_job"
                      name="about_job"
                      value={job.about_job}
                      onChange={(e) => handleTextArea(e)}
                      required
                      readOnly={isReviewMode}
                      placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                      className={`bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400 min-h-[120px] ${isReviewMode ? "bg-gray-100" : ""}`}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 flex items-center"
                      disabled={isSubmitting}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 sm:space-y-6">
                  {(
                    [
                      "qualifications",
                      "responsibilities",
                      "requiredSkills",
                    ] as const
                  ).map((field) => {
                    const icons = {
                      qualifications: (
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      ),
                      responsibilities: (
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      ),
                      requiredSkills: (
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      ),
                    };

                    const titles = {
                      qualifications: "Qualifications",
                      responsibilities: "Responsibilities",
                      requiredSkills: "Required Skills",
                    };

                    return (
                      <Card key={field} className="border border-gray-200">
                        <CardHeader className="bg-gray-50 border-b border-gray-200 p-2">
                          <CardTitle className="flex items-center gap-3 text-base sm:text-lg font-semibold text-gray-800">
                            {icons[field]}
                            {titles[field]}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                          <div className="space-y-3">
                            {(job[field] as string[]).map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  value={item}
                                  onChange={(e) => {
                                    const newValues = [
                                      ...(job[field] as string[]),
                                    ];
                                    newValues[index] = e.target.value;
                                    setJob({ ...job, [field]: newValues });
                                  }}
                                  className="flex-1 focus-visible:ring-green-500 px-2 sm:px-3 py-1 sm:py-2"
                                  placeholder={`Enter ${titles[
                                    field
                                  ].toLowerCase()}`}
                                  required
                                  readOnly={isReviewMode}
                                />
                                {index > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 sm:h-10 sm:w-10"
                                    onClick={() => removeField(field, index)}
                                    type="button"
                                    disabled={isReviewMode}
                                  >
                                    ×
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            type="button"
                            className="mt-4 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200 w-full sm:w-auto flex items-center text-sm sm:text-base"
                            onClick={() => addField(field)}
                            disabled={isSubmitting}
                          >
                            Add {titles[field].toLowerCase()}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setStep(1)}
                      disabled={isSubmitting}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </Button>
                    {!isReviewMode && (
                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 flex items-center gap-2"
                        disabled={isSubmitting}
                      >
                        {initialJob || id ? "Update Job" : "Post Job"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PostJob() {
  const [companies, setCompanies] = useState<
    { id: string; name: string; logo: string }[]
  >([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch companies
        const companiesRes = await fetch("/api/companies");
        if (!companiesRes.ok) {
          throw new Error("Failed to fetch companies");
        }
        const companiesData = await companiesRes.json();
        setCompanies(companiesData);

        // Fetch job if editing
        if (jobId) {
          const jobRes = await fetch(`/api/jobs/${jobId}`);
          if (!jobRes.ok) {
            throw new Error("Failed to fetch job");
          }
          const jobData = await jobRes.json();
          // Format deadline to YYYY-MM-DD
          const formattedJob = {
            ...jobData,
            id: jobId, // Ensure id is included
            deadline: new Date(jobData.deadline).toISOString().split("T")[0],
            qualifications: jobData.qualifications.length
              ? jobData.qualifications
              : [""],
            responsibilities: jobData.responsibilities.length
              ? jobData.responsibilities
              : [""],
            requiredSkills: jobData.requiredSkills.length
              ? jobData.requiredSkills
              : [""],
          };
          setJob(formattedJob);
        }
      } catch (err) {
        console.error(err);
        setError("Error loading data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  const handleJobSubmit = async (jobData: Job, isEdit: boolean) => {
    try {
      const url =
        isEdit && jobData.id ? `/api/jobs/${jobData.id}` : "/api/jobs";
      const method = isEdit && jobData.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      if (response.ok) {
        alert(
          isEdit ? "Job updated successfully!" : "Job posted successfully!"
        );
        router.push("/admin");
      } else {
        const errorData = await response.json();
        alert(
          `Failed to ${isEdit ? "update" : "post"} job: ${
            errorData.error || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error submitting job:", error);
      alert(
        `An error occurred while ${isEdit ? "updating" : "posting"} the job`
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return <div>No companies available. Please create a company first.</div>;
  }

  return (
    <div>
      <JobForm
        onSubmit={handleJobSubmit}
        companies={companies}
        initialJob={job || undefined}
        jobId={jobId || undefined} // Pass jobId explicitly
      />

      {/* Loading Overlay */}
      {isSubmitting && (
        <Loading variant="overlay" text="Processing job..." icon="briefcase" />
      )}
    </div>
  );
}
