"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import { toast } from "sonner";

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
  const [isActionLoading, setIsActionLoading] = useState(false);

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

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-4 sm:py-8">
      <Card className="w-full sm:max-w-3xl mx-auto shadow-lg border-0">
        <CardHeader className="bg-green-50 rounded-t-lg border-b border-green-100 p-2 sm:p-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-4 text-green-600 hover:bg-green-100"
              asChild
            >
              <Link href="/admin">
                <BsArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <CardTitle className="text-xl sm:text-2xl font-bold text-green-800 flex items-center">
              {initialJob || id ? "Edit Job Posting" : "Create Job Posting"}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
          <div className="flex justify-between items-center mb-6">
            <Link href="/admin">
              <Button variant="outline" className="flex items-center gap-2">
                <BsArrowLeft /> Back to Dashboard
              </Button>
            </Link>
            {isReviewMode && (
              <div className="flex gap-2">
                <Button
                  onClick={handleApproveJob}
                  className="bg-green-600 text-white hover:bg-green-700"
                  disabled={isActionLoading}
                >
                  {isActionLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Approve Job
                </Button>
                <Button
                  onClick={handleRejectJob}
                  variant="destructive"
                  disabled={isActionLoading}
                >
                  {isActionLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Reject Job
                </Button>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="flex items-center">
                <div
                  className={`flex items-center px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-sm sm:text-base ${
                    step === 1
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {step === 1 ? (
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  ) : (
                    <span className="w-3 h-3 sm:w-4 sm:h-4 mr-2 rounded-full bg-green-600 text-white text-[10px] sm:text-xs flex items-center justify-center">
                      1
                    </span>
                  )}
                  Basic Information
                </div>
                <div className="w-8 sm:w-16 h-px bg-gray-300 mx-2"></div>
                <div
                  className={`flex items-center px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-sm sm:text-base ${
                    step === 2
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {step === 2 ? (
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  ) : (
                    <span className="w-3 h-3 sm:w-4 sm:h-4 mr-2 rounded-full bg-green-600 text-white text-[10px] sm:text-xs flex items-center justify-center">
                      2
                    </span>
                  )}
                  Job Details
                </div>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={job.title}
                      onChange={(e) => handleInput(e)}
                      required
                      readOnly={isReviewMode}
                      className={isReviewMode ? "bg-gray-100" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyId">Company</Label>
                    <Select
                      onValueChange={handleCompanyChange}
                      value={job.companyId}
                      required
                      disabled={isReviewMode}
                    >
                      <SelectTrigger className="focus:ring-green-500">
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {companies.map((company) => (
                            <SelectItem
                              key={company.id}
                              value={company.id}
                              className="hover:bg-green-50"
                            >
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Industry</Label>
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
                      <SelectTrigger className="focus:ring-green-500">
                        <SelectValue placeholder="Select an industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {industryOptions.map((option) => (
                            <SelectItem
                              key={option}
                              value={option}
                              className="hover:bg-green-50"
                            >
                              {option}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={job.location}
                      onChange={(e) => handleInput(e)}
                      required
                      readOnly={isReviewMode}
                      className={isReviewMode ? "bg-gray-100" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Application Deadline</Label>
                    <Input
                      type="date"
                      id="deadline"
                      name="deadline"
                      value={job.deadline}
                      onChange={(e) => handleInput(e)}
                      required
                      readOnly={isReviewMode}
                      className={isReviewMode ? "bg-gray-100" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site">Employment Type</Label>
                    <Select
                      name="site"
                      value={job.site}
                      onValueChange={(value) =>
                        handleInput({
                          target: { name: "site", value },
                        } as React.ChangeEvent<HTMLSelectElement>)
                      }
                      disabled={isReviewMode}
                    >
                      <SelectTrigger className="focus:ring-green-500">
                        <SelectValue placeholder="Select Employment Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem
                            value="Full_time"
                            className="hover:bg-green-50"
                          >
                            Full-time
                          </SelectItem>
                          <SelectItem
                            value="Part_time"
                            className="hover:bg-green-50"
                          >
                            Part-time
                          </SelectItem>
                          <SelectItem
                            value="Freelance"
                            className="hover:bg-green-50"
                          >
                            Freelance
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about_job">Job Description</Label>
                    <Textarea
                      id="about_job"
                      name="about_job"
                      value={job.about_job}
                      onChange={(e) => handleTextArea(e)}
                      required
                      readOnly={isReviewMode}
                      className={isReviewMode ? "bg-gray-100" : ""}
                    />
                  </div>
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
  const isReviewMode = searchParams.get("mode") === "review";

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
    </div>
  );
}
