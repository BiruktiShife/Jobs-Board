"use client";

import { useState, useEffect } from "react";
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
import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  Globe,
  Info,
  ListTodo,
  Loader2,
  MapPin,
  Wrench,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
} from "lucide-react";
import { FaBuilding } from "react-icons/fa";

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

interface JobFormProps {
  onSubmit: (job: Job) => void;
  companies: { id: string; name: string; logo: string }[];
}

function JobForm({ onSubmit, companies }: JobFormProps) {
  const [job, setJob] = useState<Job>({
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
  });
  const [step, setStep] = useState(1);
  const [, setPreview] = useState<string | null>(null);

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
    if (typeof onSubmit === "function") {
      onSubmit(job);
    } else {
      console.error("onSubmit is not a function");
    }

    setJob({
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
    setPreview(null);
  };

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
              asChild
            >
              <Link href="/admin">
                <BsArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <CardTitle className="text-xl sm:text-2xl font-bold text-green-800 flex items-center">
              <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 mr-3 text-green-600" />
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
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="companyId"
                    className="ml-2 mb-2 flex items-center gap-2 font-semibold text-gray-700 text-sm sm:text-base"
                  >
                    <FaBuilding className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    Company
                  </Label>
                  <Select
                    onValueChange={handleCompanyChange}
                    value={job.companyId}
                    required
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
                      required
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
                      required
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
                      required
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
                      required
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
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 flex items-center"
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
                                required
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

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setStep(1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 flex items-center gap-2"
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

export default function PostJob() {
  const [companies, setCompanies] = useState<
    { id: string; name: string; logo: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("/api/companies");
        if (response.ok) {
          const data = await response.json();
          setCompanies(data);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleJobSubmit = async (job: Job) => {
    try {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (companies.length === 0) {
    return <div>No companies available. Please create a company first.</div>;
  }

  return (
    <div>
      <JobForm onSubmit={handleJobSubmit} companies={companies} />
    </div>
  );
}
