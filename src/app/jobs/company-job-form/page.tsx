"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BsArrowLeft, BsPlus } from "react-icons/bs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Briefcase,
  Building2,
  MapPin,
  CalendarDays,
  Globe,
  Info,
  BadgeCheck,
  ListTodo,
  Wrench,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Job {
  title: string;
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

interface CompanyJobFormProps {
  onSubmit: (job: Job) => void;
  canPost: boolean;
}

function CompanyJobForm({ onSubmit, canPost }: CompanyJobFormProps) {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [job, setJob] = useState<Job>({
    title: "",
    logo: "",
    area: "",
    location: "",
    deadline: "",
    site: "Full_time",
    qualifications: [""],
    responsibilities: [""],
    about_job: "",
    requiredSkills: [""],
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPost) {
      toast.error(
        "Cannot post jobs until your company is approved by an admin."
      );
      return;
    }
    if (
      !job.title ||
      !job.area ||
      !job.location ||
      !job.deadline ||
      !job.about_job
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(job);
      setJob({
        title: "",
        logo: job.logo,
        area: "",
        location: "",
        deadline: "",
        site: "Full_time",
        qualifications: [""],
        responsibilities: [""],
        about_job: "",
        requiredSkills: [""],
      });
      setStep(1);
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-4 sm:py-8">
      <div className="w-full sm:max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="mr-4 text-indigo-600 hover:bg-indigo-100 hover:scale-105 transition-all duration-200"
              onClick={() => router.push("/dashboard/company")}
            >
              <BsArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Create Job Posting
              </h1>
              <p className="text-gray-600 mt-2">
                Share your opportunity with talented professionals
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 rounded-t-lg border-b border-indigo-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                    Job Details Form
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    Fill in the information to create your job posting
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {!canPost && (
              <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">
                    Pending Approval
                  </h3>
                  <p className="text-sm">
                    Your company is awaiting admin approval. You can fill out
                    the form, but job posting is disabled until approved.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Progress Steps */}
              <div className="flex justify-center mb-8 sm:mb-10">
                <div className="flex items-center bg-white rounded-full p-2 shadow-lg border border-gray-100">
                  <div
                    className={`flex items-center px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                      step === 1
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105"
                        : step > 1
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {step > 1 ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <span className="w-6 h-6 mr-2 rounded-full bg-white/20 text-white text-xs flex items-center justify-center font-bold">
                        1
                      </span>
                    )}
                    Basic Information
                  </div>
                  <div className="w-12 h-px bg-gradient-to-r from-gray-300 to-gray-400 mx-3"></div>
                  <div
                    className={`flex items-center px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                      step === 2
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <span className="w-6 h-6 mr-2 rounded-full bg-white/20 text-white text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    Job Details
                  </div>
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-right-5 duration-500">
                  {/* Job Title */}
                  <div className="group">
                    <Label
                      htmlFor="title"
                      className="mb-3 flex items-center gap-3 font-semibold text-gray-700 text-base"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-4 w-4 text-indigo-600" />
                      </div>
                      Job Title
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={job.title}
                      onChange={handleInput}
                      className="h-12 text-base border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200 group-hover:border-gray-300"
                      placeholder="e.g. Senior Frontend Developer"
                      required
                    />
                  </div>

                  {/* Grid Layout for Form Fields */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Industry Area */}
                    <div className="group">
                      <Label
                        htmlFor="area"
                        className="mb-3 flex items-center gap-3 font-semibold text-gray-700 text-base"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        Industry Area
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setJob({ ...job, area: value })
                        }
                        value={job.area}
                        required
                      >
                        <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200 group-hover:border-gray-300">
                          <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectGroup>
                            {industryOptions.map((option) => (
                              <SelectItem
                                key={option}
                                value={option}
                                className="hover:bg-indigo-50 focus:bg-indigo-50"
                              >
                                {option}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location */}
                    <div className="group">
                      <Label
                        htmlFor="location"
                        className="mb-3 flex items-center gap-3 font-semibold text-gray-700 text-base"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                        </div>
                        Location
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        value={job.location}
                        onChange={handleInput}
                        className="h-12 text-base border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200 group-hover:border-gray-300"
                        placeholder="e.g. New York, NY or Remote"
                        required
                      />
                    </div>

                    {/* Application Deadline */}
                    <div className="group">
                      <Label
                        htmlFor="deadline"
                        className="mb-3 flex items-center gap-3 font-semibold text-gray-700 text-base"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                          <CalendarDays className="h-4 w-4 text-orange-600" />
                        </div>
                        Application Deadline
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="deadline"
                        type="date"
                        name="deadline"
                        value={job.deadline}
                        onChange={handleInput}
                        className="h-12 text-base border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200 group-hover:border-gray-300"
                        required
                      />
                    </div>

                    {/* Employment Type */}
                    <div className="group lg:col-span-2">
                      <Label
                        htmlFor="site"
                        className="mb-3 flex items-center gap-3 font-semibold text-gray-700 text-base"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                          <Globe className="h-4 w-4 text-purple-600" />
                        </div>
                        Employment Type
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setJob({ ...job, site: value as Job["site"] })
                        }
                        defaultValue={job.site}
                        required
                      >
                        <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200 group-hover:border-gray-300">
                          <SelectValue placeholder="Select Employment Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem
                              value="Full_time"
                              className="hover:bg-indigo-50 focus:bg-indigo-50"
                            >
                              Full-time
                            </SelectItem>
                            <SelectItem
                              value="Part_time"
                              className="hover:bg-indigo-50 focus:bg-indigo-50"
                            >
                              Part-time
                            </SelectItem>
                            <SelectItem
                              value="Freelance"
                              className="hover:bg-indigo-50 focus:bg-indigo-50"
                            >
                              Freelance
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="group">
                    <Label
                      htmlFor="about_job"
                      className="mb-3 flex items-center gap-3 font-semibold text-gray-700 text-base"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
                        <Info className="h-4 w-4 text-cyan-600" />
                      </div>
                      Job Description
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="about_job"
                      name="about_job"
                      value={job.about_job}
                      onChange={handleTextArea}
                      rows={6}
                      className="text-base border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200 group-hover:border-gray-300 resize-none"
                      placeholder="Describe the role, responsibilities, company culture, benefits, and what makes this opportunity exciting..."
                      required
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Provide a detailed description to attract the right
                      candidates
                    </p>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-end pt-6">
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 hover:scale-105"
                      disabled={submitting}
                    >
                      Continue to Details
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-left-5 duration-500">
                  {(
                    [
                      "qualifications",
                      "responsibilities",
                      "requiredSkills",
                    ] as const
                  ).map((field) => {
                    const icons = {
                      qualifications: (
                        <BadgeCheck className="h-5 w-5 text-emerald-600" />
                      ),
                      responsibilities: (
                        <ListTodo className="h-5 w-5 text-blue-600" />
                      ),
                      requiredSkills: (
                        <Wrench className="h-5 w-5 text-purple-600" />
                      ),
                    };

                    const titles = {
                      qualifications: "Qualifications",
                      responsibilities: "Key Responsibilities",
                      requiredSkills: "Required Skills",
                    };

                    const descriptions = {
                      qualifications:
                        "List the education, experience, and qualifications needed",
                      responsibilities:
                        "Outline the main duties and responsibilities",
                      requiredSkills:
                        "Specify the technical and soft skills required",
                    };

                    const gradients = {
                      qualifications: "from-emerald-50 to-green-50",
                      responsibilities: "from-blue-50 to-indigo-50",
                      requiredSkills: "from-purple-50 to-pink-50",
                    };

                    return (
                      <Card
                        key={field}
                        className="border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        <CardHeader
                          className={`bg-gradient-to-r ${gradients[field]} border-b border-gray-100 p-6`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                {icons[field]}
                              </div>
                              <div>
                                <CardTitle className="text-xl font-bold text-gray-800">
                                  {titles[field]}
                                </CardTitle>
                                <p className="text-sm text-gray-600 mt-1">
                                  {descriptions[field]}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {(job[field] as string[]).map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 group"
                              >
                                <div className="flex-1 relative">
                                  <Input
                                    value={item}
                                    onChange={(e) => {
                                      const newValues = [
                                        ...(job[field] as string[]),
                                      ];
                                      newValues[index] = e.target.value;
                                      setJob({ ...job, [field]: newValues });
                                    }}
                                    className="h-12 text-base border-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200 pr-4"
                                    placeholder={`Enter ${titles[field].toLowerCase()}`}
                                  />
                                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-indigo-400 rounded-full opacity-50"></div>
                                </div>
                                {index > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-12 w-12 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
                                    onClick={() => removeField(field, index)}
                                    type="button"
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
                            className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 border-2 border-gray-200 hover:border-indigo-300 w-full flex items-center justify-center gap-2 h-12 text-base font-medium rounded-xl transition-all duration-200"
                            onClick={() => addField(field)}
                            disabled={submitting}
                          >
                            <BsPlus className="h-5 w-5" />
                            Add {titles[field]}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Navigation */}
                  <div className="flex flex-col sm:flex-row justify-between gap-4 pt-8">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 px-6 py-3 text-base font-medium rounded-xl transition-all duration-200"
                      onClick={() => setStep(1)}
                      disabled={submitting}
                    >
                      <ChevronLeft className="h-5 w-5" />
                      Back to Basic Info
                    </Button>
                    <Button
                      type="submit"
                      className={`px-8 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 ${
                        canPost
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:scale-105"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={submitting || !canPost}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Briefcase className="h-5 w-5" />
                          {canPost
                            ? "Publish Job Posting"
                            : "Approval Required"}
                        </>
                      )}
                    </Button>
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

export default function CompanyPostJob() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [canPost, setCanPost] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [companyLogo, setCompanyLogo] = useState("");

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const checkCompany = async () => {
      setIsLoadingStatus(true);
      try {
        const response = await fetch(
          `/api/companies?adminId=${session.user.id}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch company");
        }
        const companies = await response.json();
        if (companies.length === 0) {
          toast.error(
            "No company registered. Please complete company registration."
          );
          router.push("/company/register");
          return;
        }
        const company = companies[0];
        if (company.status !== "APPROVED") {
          toast.warning(
            "Your company is awaiting admin approval. You cannot post jobs until approved."
          );
          setCanPost(false);
        } else {
          setCanPost(true);
        }
        setCompanyLogo(company.logo || "");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to verify company status"
        );
        setCanPost(false);
      } finally {
        setIsLoadingStatus(false);
      }
    };
    checkCompany();
  }, [session, status, router]);

  const handleJobSubmit = async (job: Job) => {
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...job, logo: job.logo || companyLogo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post job");
      }

      toast.success("Job posted successfully! Awaiting admin approval.");
      router.push("/dashboard/company");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while posting the job"
      );
    }
  };

  if (status === "loading" || isLoadingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Loading...</h3>
            <p className="text-gray-600">Preparing your job posting form</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "COMPANY_ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm border-2 border-red-200 text-red-700 p-8 rounded-2xl max-w-md text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You must be a company administrator to access the job posting form.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl"
          >
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <CompanyJobForm onSubmit={handleJobSubmit} canPost={canPost} />
    </div>
  );
}
