"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";

export default function ApplicationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const jobId = searchParams.get("jobId");
  const jobTitle = searchParams.get("title");

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    yearOfBirth: new Date().getFullYear() - 25,
    address: "",
    phone: "",
    portfolio: "",
    profession: "",
    careerLevel: "",
    coverLetter: "",
    degreeType: "",
    institution: "",
    graduationDate: new Date(),
    projects: "",
    volunteerWork: "",
  });

  const [experiences, setExperiences] = useState([
    { jobTitle: "", company_name: "", location: "", responsibilities: "" },
  ]);

  const [skills, setSkills] = useState([""]);
  const [certifications, setCertifications] = useState([""]);
  const [languages, setLanguages] = useState([""]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isCheckingApplication, setIsCheckingApplication] = useState(true);

  const degreeTypes = [
    "High School Diploma",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "PhD",
    "Other",
  ];

  const careerLevels = [
    "Junior Level (1-3 years)",
    "Mid Level (3-5 years)",
    "Senior (5-8 years)",
    "Executive (VP, Director)",
    "Senior Executive (C Level)",
  ];

  // Check if user has already applied
  useEffect(() => {
    const checkApplication = async () => {
      if (!session?.user?.id || !jobId) {
        setIsCheckingApplication(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/check-application?userId=${session.user.id}&jobId=${jobId}`
        );
        const data = await response.json();
        setHasApplied(data.hasApplied);
      } catch (error) {
        console.error("Error checking application:", error);
      } finally {
        setIsCheckingApplication(false);
      }
    };

    if (status !== "loading") {
      checkApplication();
    }
  }, [session, jobId, status]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle experience changes
  const handleExperienceChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setExperiences((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp))
    );
  };

  // Add new experience
  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      { jobTitle: "", company_name: "", location: "", responsibilities: "" },
    ]);
  };

  // Remove experience
  const removeExperience = (index: number) => {
    if (experiences.length > 1) {
      setExperiences((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Handle array field changes (skills, certifications, languages)
  const handleArrayChange = (
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setArray((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  // Add new array item
  const addArrayItem = (
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (array.length < 5) {
      setArray((prev) => [...prev, ""]);
    }
  };

  // Remove array item
  const removeArrayItem = (
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    if (array.length > 1) {
      setArray((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
    } else {
      toast.error("Please select a PDF file");
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id || !jobId) {
      toast.error("Missing required information");
      return;
    }

    if (hasApplied) {
      toast.error("You have already applied to this job");
      return;
    }

    if (!resumeFile) {
      toast.error("Please upload your resume (PDF)");
      return;
    }

    // Validate required fields
    if (
      !formData.fullName ||
      !formData.profession ||
      !formData.careerLevel ||
      !formData.degreeType
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate experiences
    const validExperiences = experiences.filter(
      (exp) =>
        exp.jobTitle.trim() &&
        exp.company_name.trim() &&
        exp.location.trim() &&
        exp.responsibilities.trim()
    );

    if (validExperiences.length === 0) {
      toast.error("Please add at least one work experience");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload resume
      let resumeUrl = "";
      if (resumeFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", resumeFile);

        const uploadResponse = await fetch("/api/pinata/upload?type=resume", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload resume");
        }

        const uploadData = await uploadResponse.json();
        resumeUrl = uploadData.url;
        setIsUploading(false);
      }

      // Submit application
      const applicationData = {
        jobId,
        fullName: formData.fullName,
        email: session.user.email,
        yearOfBirth: formData.yearOfBirth,
        address: formData.address,
        phone: formData.phone,
        portfolio: formData.portfolio.trim() || "",
        profession: formData.profession,
        careerLevel: formData.careerLevel,
        coverLetter: formData.coverLetter,
        experiences: validExperiences,
        degreeType: formData.degreeType,
        institution: formData.institution,
        graduationDate: formData.graduationDate.toISOString(),
        skills: skills.filter((s) => s.trim()),
        certifications: certifications.filter((c) => c.trim()),
        languages: languages.filter((l) => l.trim()),
        projects: formData.projects.trim() || "",
        volunteerWork: formData.volunteerWork.trim() || "",
        resumeUrl,
      };

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details && Array.isArray(errorData.details)) {
          // Show validation errors
          const validationErrors = errorData.details
            .map((err: { message: string }) => err.message)
            .join(", ");
          throw new Error(`Validation failed: ${validationErrors}`);
        }
        throw new Error(errorData.error || "Failed to submit application");
      }

      toast.success("Application submitted successfully! 🎉");
      setHasApplied(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  // Loading state
  if (status === "loading" || isCheckingApplication) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">
            Loading application form...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Authentication Required
          </h2>
          <p className="text-slate-600 mb-4">Please log in to apply for jobs</p>
          <Button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Missing job ID
  if (!jobId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Missing Job Information
          </h2>
          <p className="text-slate-600 mb-4">No job ID provided</p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  // Already applied
  if (hasApplied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Already Applied
          </h2>
          <p className="text-slate-600 mb-4">
            You have already applied to this job
          </p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Main form render
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Jobs
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Apply for {jobTitle || "Position"}
          </h1>
          <p className="text-slate-600">
            Fill out the form below to submit your application
          </p>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="fullName"
                  className="text-slate-700 font-medium"
                >
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className="mt-1"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="yearOfBirth"
                  className="text-slate-700 font-medium"
                >
                  Year of Birth *
                </Label>
                <Input
                  id="yearOfBirth"
                  type="number"
                  value={formData.yearOfBirth}
                  onChange={(e) =>
                    handleInputChange("yearOfBirth", parseInt(e.target.value))
                  }
                  className="mt-1"
                  min="1950"
                  max={new Date().getFullYear()}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-slate-700 font-medium">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="mt-1"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="portfolio"
                  className="text-slate-700 font-medium"
                >
                  Portfolio/Website
                </Label>
                <Input
                  id="portfolio"
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) =>
                    handleInputChange("portfolio", e.target.value)
                  }
                  className="mt-1"
                  placeholder="https://your-portfolio.com"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-slate-700 font-medium">
                  Address *
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="mt-1"
                  placeholder="Enter your full address"
                  rows={2}
                  required
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="profession"
                  className="text-slate-700 font-medium"
                >
                  Profession *
                </Label>
                <Input
                  id="profession"
                  type="text"
                  value={formData.profession}
                  onChange={(e) =>
                    handleInputChange("profession", e.target.value)
                  }
                  className="mt-1"
                  placeholder="e.g., Software Developer"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="careerLevel"
                  className="text-slate-700 font-medium"
                >
                  Career Level *
                </Label>
                <Select
                  value={formData.careerLevel}
                  onValueChange={(value) =>
                    handleInputChange("careerLevel", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your career level" />
                  </SelectTrigger>
                  <SelectContent>
                    {careerLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Label
                htmlFor="coverLetter"
                className="text-slate-700 font-medium"
              >
                Cover Letter *
              </Label>
              <Textarea
                id="coverLetter"
                value={formData.coverLetter}
                onChange={(e) =>
                  handleInputChange("coverLetter", e.target.value)
                }
                className="mt-1"
                placeholder="Tell us why you're interested in this position..."
                rows={4}
                required
              />
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              Work Experience
            </h2>
            {experiences.map((experience, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-slate-700">
                    Experience {index + 1}
                  </h3>
                  {experiences.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExperience(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700 font-medium">
                      Job Title *
                    </Label>
                    <Input
                      type="text"
                      value={experience.jobTitle}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "jobTitle",
                          e.target.value
                        )
                      }
                      className="mt-1"
                      placeholder="e.g., Software Engineer"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium">
                      Company Name *
                    </Label>
                    <Input
                      type="text"
                      value={experience.company_name}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "company_name",
                          e.target.value
                        )
                      }
                      className="mt-1"
                      placeholder="e.g., Tech Corp"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium">
                      Location *
                    </Label>
                    <Input
                      type="text"
                      value={experience.location}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "location",
                          e.target.value
                        )
                      }
                      className="mt-1"
                      placeholder="e.g., New York, NY"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-slate-700 font-medium">
                      Responsibilities *
                    </Label>
                    <Textarea
                      value={experience.responsibilities}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "responsibilities",
                          e.target.value
                        )
                      }
                      className="mt-1"
                      placeholder="Describe your key responsibilities and achievements..."
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addExperience}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Another Experience
            </Button>
          </div>

          {/* Education */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">4</span>
              </div>
              Education
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="degreeType"
                  className="text-slate-700 font-medium"
                >
                  Degree Type *
                </Label>
                <Select
                  value={formData.degreeType}
                  onValueChange={(value) =>
                    handleInputChange("degreeType", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your degree" />
                  </SelectTrigger>
                  <SelectContent>
                    {degreeTypes.map((degree) => (
                      <SelectItem key={degree} value={degree}>
                        {degree}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="institution"
                  className="text-slate-700 font-medium"
                >
                  Institution *
                </Label>
                <Input
                  id="institution"
                  type="text"
                  value={formData.institution}
                  onChange={(e) =>
                    handleInputChange("institution", e.target.value)
                  }
                  className="mt-1"
                  placeholder="e.g., University of Technology"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-700 font-medium">
                  Graduation Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.graduationDate
                        ? format(formData.graduationDate, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.graduationDate}
                      onSelect={(date) =>
                        date && handleInputChange("graduationDate", date)
                      }
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Skills & Qualifications */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">5</span>
              </div>
              Skills & Qualifications
            </h2>

            {/* Skills */}
            <div className="mb-6">
              <Label className="text-slate-700 font-medium mb-2 block">
                Skills
              </Label>
              {skills.map((skill, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={skill}
                    onChange={(e) =>
                      handleArrayChange(
                        skills,
                        setSkills,
                        index,
                        e.target.value
                      )
                    }
                    placeholder="e.g., JavaScript, React, Node.js"
                    className="flex-1"
                  />
                  {skills.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem(skills, setSkills, index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {skills.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(skills, setSkills)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </Button>
              )}
            </div>

            {/* Certifications */}
            <div className="mb-6">
              <Label className="text-slate-700 font-medium mb-2 block">
                Certifications
              </Label>
              {certifications.map((cert, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={cert}
                    onChange={(e) =>
                      handleArrayChange(
                        certifications,
                        setCertifications,
                        index,
                        e.target.value
                      )
                    }
                    placeholder="e.g., AWS Certified Developer"
                    className="flex-1"
                  />
                  {certifications.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        removeArrayItem(
                          certifications,
                          setCertifications,
                          index
                        )
                      }
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {certifications.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addArrayItem(certifications, setCertifications)
                  }
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Certification
                </Button>
              )}
            </div>

            {/* Languages */}
            <div>
              <Label className="text-slate-700 font-medium mb-2 block">
                Languages
              </Label>
              {languages.map((lang, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={lang}
                    onChange={(e) =>
                      handleArrayChange(
                        languages,
                        setLanguages,
                        index,
                        e.target.value
                      )
                    }
                    placeholder="e.g., English (Native), Spanish (Fluent)"
                    className="flex-1"
                  />
                  {languages.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        removeArrayItem(languages, setLanguages, index)
                      }
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {languages.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(languages, setLanguages)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Language
                </Button>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">6</span>
              </div>
              Additional Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="projects"
                  className="text-slate-700 font-medium"
                >
                  Notable Projects
                </Label>
                <Textarea
                  id="projects"
                  value={formData.projects}
                  onChange={(e) =>
                    handleInputChange("projects", e.target.value)
                  }
                  className="mt-1"
                  placeholder="Describe any notable projects you've worked on..."
                  rows={3}
                />
              </div>
              <div>
                <Label
                  htmlFor="volunteerWork"
                  className="text-slate-700 font-medium"
                >
                  Volunteer Work
                </Label>
                <Textarea
                  id="volunteerWork"
                  value={formData.volunteerWork}
                  onChange={(e) =>
                    handleInputChange("volunteerWork", e.target.value)
                  }
                  className="mt-1"
                  placeholder="Describe any volunteer work or community involvement..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">7</span>
              </div>
              Resume Upload
            </h2>
            <div>
              <Label htmlFor="resume" className="text-slate-700 font-medium">
                Upload Resume (PDF) *
              </Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-1"
                required
              />
              {resumeFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {resumeFile.name} selected
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <p className="text-sm text-slate-600">
                By submitting this application, you confirm that all information
                provided is accurate.
              </p>
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 min-w-[150px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {isUploading ? "Uploading..." : "Submitting..."}
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading Overlay */}
      {(isSubmitting || isUploading) && (
        <Loading
          variant="overlay"
          text={
            isUploading ? "Uploading resume..." : "Submitting application..."
          }
          icon="file"
        />
      )}
    </div>
  );
}
