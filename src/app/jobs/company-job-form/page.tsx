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
} from "lucide-react";

interface Job {
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

interface CompanyJobFormProps {
  onSubmit: (job: Job) => void;
}

function CompanyJobForm({ onSubmit }: CompanyJobFormProps) {
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);

  const router = useRouter();
  const [job, setJob] = useState<Job>({
    title: "",
    companyId: "",
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "COMPANY_ADMIN") {
      router.push("/login");
      return;
    }

    const fetchCompanyData = async () => {
      try {
        const response = await fetch(
          `/api/companies?adminId=${session.user.id}`
        );
        if (response.ok) {
          const company = await response.json();
          setJob((prev) => ({
            ...prev,
            companyId: company.id,
            logo: company.logo || "",
          }));
        } else {
          console.error("Failed to fetch company data");
        }
      } catch (error) {
        console.error("Error fetching company:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [session, status, router]);

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
    if (typeof onSubmit === "function") {
      onSubmit(job);
    } else {
      console.error("onSubmit is not a function");
    }

    setJob({
      title: "",
      companyId: job.companyId,
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
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const industryOptions = [
    "Programming",
    "Business",
    "Healthcare",
    "Education",
    "Fashion Design",
    "Finance",
    "Sales",
    "Engineering",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-4 sm:py-8">
      <Card className="w-full sm:max-w-3xl mx-auto shadow-lg border-0">
        <CardHeader className="bg-green-50 rounded-t-lg border-b border-green-100 p-2 sm:p-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-4 text-green-600 hover:bg-green-100"
              onClick={() => router.push("/dashboard/company")}
            >
              <BsArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <CardTitle className="text-xl sm:text-2xl font-bold text-green-800 flex items-center">
              Create Job Posting
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-8">
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
                <div>
                  <Label
                    htmlFor="title"
                    className="ml-2 mb-2 flex items-center gap-2 font-semibold text-gray-700 text-sm sm:text-base"
                  >
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    Job Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={job.title}
                    onChange={handleInput}
                    className="focus-visible:ring-green-500"
                    placeholder="e.g. Senior Frontend Developer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label
                      htmlFor="area"
                      className="ml-2 mb-2 flex items-center gap-2 font-semibold text-gray-700 text-sm sm:text-base"
                    >
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      Industry Area
                    </Label>
                    <Select
                      onValueChange={(value) => setJob({ ...job, area: value })}
                      value={job.area}
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

                  <div>
                    <Label
                      htmlFor="location"
                      className="ml-2 mb-2 flex items-center gap-2 font-semibold text-gray-700 text-sm sm:text-base"
                    >
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={job.location}
                      onChange={handleInput}
                      placeholder="e.g. New York, NY"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="deadline"
                      className="ml-2 mb-2 flex items-center gap-2 font-semibold text-gray-700 text-sm sm:text-base"
                    >
                      <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      Deadline
                    </Label>
                    <Input
                      id="deadline"
                      type="date"
                      name="deadline"
                      value={job.deadline}
                      onChange={handleInput}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="site"
                      className="ml-2 mb-2 flex items-center gap-2 font-semibold text-gray-700 text-sm sm:text-base"
                    >
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      Employment Type
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setJob({ ...job, site: value as Job["site"] })
                      }
                      defaultValue={job.site}
                    >
                      <SelectTrigger>
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
                </div>

                <div>
                  <Label
                    htmlFor="about_job"
                    className="ml-2 mb-2 flex items-center gap-2 font-semibold text-gray-700 text-sm sm:text-base"
                  >
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    About the Job
                  </Label>
                  <Textarea
                    id="about_job"
                    name="about_job"
                    value={job.about_job}
                    onChange={handleTextArea}
                    rows={4}
                    className="focus-visible:ring-green-500 h-32 sm:h-40"
                    placeholder="Describe the job responsibilities, company culture, and other relevant details..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto flex items-center"
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
                      <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    ),
                    responsibilities: (
                      <ListTodo className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    ),
                    requiredSkills: (
                      <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
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
                              />
                              {index > 0 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 sm:h-10 sm:w-10"
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
                          className="mt-4 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200 w-full sm:w-auto flex items-center text-sm sm:text-base"
                          onClick={() => addField(field)}
                        >
                          <BsPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          Add {titles[field].toLowerCase()}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}

                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3"
                    onClick={() => setStep(1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto flex items-center gap-2"
                  >
                    <Briefcase className="h-4 w-4" />
                    Post Job
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CompanyPostJob() {
  const { data: session, status } = useSession();

  const handleJobSubmit = async (job: Job) => {
    try {
      console.log("Submitting job:", job);
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });

      if (response.ok) {
        alert("Job posted successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to post job: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting job:", error);
      alert("An error occurred while posting the job");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!session || session.user.role !== "COMPANY_ADMIN") {
    return <div>You must be a company admin to post a job.</div>;
  }

  return (
    <div>
      <CompanyJobForm onSubmit={handleJobSubmit} />
    </div>
  );
}
