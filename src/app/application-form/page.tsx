"use client";

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
import { useEffect, useState } from "react";
import {
  FaUser,
  FaBriefcase,
  FaGraduationCap,
  FaBookOpen,
  FaCode,
  FaAward,
  FaLanguage,
  FaHandHoldingHeart,
  FaFileAlt,
  FaCalendar,
} from "react-icons/fa";
import { CalendarIcon, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { FiPlus } from "react-icons/fi";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { applicationSchema } from "@/app/api/applications/route";
import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import { motion } from "framer-motion";

export default function ApplicationForm() {
  const [graduationDate, setGraduationDate] = useState<Date | undefined>(
    new Date()
  );
  const [skills, setSkills] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [experiences, setExperiences] = useState([
    { jobTitle: "", company_name: "", location: "", responsibilities: "" },
  ]);
  const [fullName, setFullName] = useState("");
  const [yearOfBirth, setYearOfBirth] = useState<number | undefined>();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [profession, setProfession] = useState("");
  const [careerLevel, setCareerLevel] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [degreeType, setDegreeType] = useState("");
  const [institution, setInstitution] = useState("");
  const [projects, setProjects] = useState("");
  const [volunteerWork, setVolunteerWork] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const [isCheckingApplication, setIsCheckingApplication] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const title = searchParams.get("title");
  const router = useRouter();
  const { data: session, status } = useSession();

  const degreeTypes = [
    "High School Diploma",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "PhD",
    "Other",
  ];
  const careerLevels = [
    "Senior Executive(C Level)",
    "Executive(VP, Director)",
    "Senior(5-8 years)",
    "Mid Level(3-5 years)",
    "Junior Level(1-3 years)",
  ];

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!session?.user.id || !jobId) {
        setIsCheckingApplication(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/check-application?userId=${session.user.id}&jobId=${jobId}`
        );
        const data = await response.json();
        if (response.ok) {
          setHasApplied(data.hasApplied);
        } else {
          console.error("Failed to check application status:", data.error);
        }
      } catch (err) {
        console.error("Error checking application status:", err);
      } finally {
        setIsCheckingApplication(false);
      }
    };

    checkApplicationStatus();
  }, [session, jobId]);

  useEffect(() => {
    if (hasApplied && !isCheckingApplication) {
      alert("You have already applied to this job.");
    }
  }, [hasApplied, isCheckingApplication]);

  useEffect(() => {
    if (status !== "loading" && !jobId) {
      setError("Job ID is missing. Please select a job to apply for.");
      router.push("/dashboard");
    }
  }, [jobId, status, router]);

  type Experience = {
    jobTitle: string;
    company_name: string;
    location: string;
    responsibilities: string;
  };

  type ExperienceField = keyof Experience;

  const handleAddSkill = () => {
    if (skills.length < 5) setSkills([...skills, ""]);
  };

  const handleAddCertification = () => {
    if (certifications.length < 5) setCertifications([...certifications, ""]);
  };

  const handleAddLanguage = () => {
    if (languages.length < 5) setLanguages([...languages, ""]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const name = e.target.name as ExperienceField;
    const value = e.target.value;
    setExperiences((prev) =>
      prev.map((exp, idx) => (idx === index ? { ...exp, [name]: value } : exp))
    );
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      { jobTitle: "", company_name: "", location: "", responsibilities: "" },
    ]);
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!session || session.user.role !== "JOB_SEEKER") {
      setError("You must be logged in as a Job Seeker to apply.");
      router.push("/login");
      return;
    }

    if (!jobId) {
      setError("Job ID is missing.");
      return;
    }

    if (hasApplied) {
      setError("You have already applied to this job.");
      return;
    }

    if (!resumeFile) {
      setError("Please upload a resume (PDF).");
      return;
    }

    const validExperiences = experiences.filter(
      (exp) =>
        exp.jobTitle.trim() &&
        exp.company_name.trim() &&
        exp.location.trim() &&
        exp.responsibilities.trim()
    );

    if (validExperiences.length === 0) {
      setError("At least one valid work experience is required.");
      return;
    }

    let resumeUrl = "";
    if (resumeFile) {
      setIsUploading(true);
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log("Pinata resume upload attempt:", attempt);
          const formData = new FormData();
          formData.append("file", resumeFile);
          const response = await fetch("/api/pinata/upload?type=resume", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || "Failed to upload resume");
          }

          resumeUrl = data.url;
          console.log("Pinata resume upload success:", resumeUrl);
          break;
        } catch (err) {
          console.error(
            "Pinata resume upload error (attempt",
            attempt,
            "):",
            err
          );
          if (attempt === 3) {
            setError(
              "Failed to upload resume after multiple attempts. Please try again."
            );
            setIsUploading(false);
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      setIsUploading(false);
    }

    const formData = {
      jobId,
      fullName,
      email: session.user.email,
      yearOfBirth: yearOfBirth || new Date().getFullYear(),
      address,
      phone,
      portfolio,
      profession,
      careerLevel,
      coverLetter,
      experiences: validExperiences,
      degreeType,
      institution,
      graduationDate: graduationDate?.toISOString(),
      skills: skills.filter((s) => s.trim()),
      certifications: certifications.filter((c) => c.trim()),
      languages: languages.filter((l) => l.trim()),
      projects,
      volunteerWork,
      resumeUrl,
    };

    try {
      const validatedData = applicationSchema.parse(formData);
      console.log("🚀 ~ handleSubmit ~ validatedData:", validatedData);

      console.log("Submitting form data:", formData);
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          setHasApplied(true);
          throw new Error("You have already applied to this job");
        }
        throw new Error(errorData.error || "Failed to submit application");
      }

      setSuccess("Application submitted successfully!🎉");
      setHasApplied(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while submitting the application";
      setError(errorMessage);
      console.error("Error submitting application:", err);
    }
  };

  if (status === "loading" || isCheckingApplication) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!jobId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-green-700">
          <span className="mr-5">
            <Link href="/dashboard">
              <BsArrowLeft />{" "}
            </Link>
          </span>
          Apply for {title}
        </h1>
        {hasApplied ? (
          <p className="text-center text-red-500 mb-4">
            You have already applied to this job.
          </p>
        ) : (
          <>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center text-sm text-red-700 bg-red-100 p-3 rounded-md shadow-sm mb-4"
              >
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center text-sm text-green-700 bg-green-100 p-3 rounded-md shadow-sm mb-4"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                {success}
              </motion.div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaUser className="mr-2 h-6 w-6 text-green-600" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 w-full"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearOfBirth">Year of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {yearOfBirth ? yearOfBirth : <span>Pick a year</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            yearOfBirth ? new Date(yearOfBirth, 0) : undefined
                          }
                          onSelect={(date) =>
                            setYearOfBirth(date?.getFullYear())
                          }
                          startMonth={new Date(1960, 0)}
                          endMonth={new Date(2017, 11)}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      type="email"
                      id="email"
                      value={session?.user.email || ""}
                      disabled
                      className="mt-1 w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Current Address</Label>
                    <Input
                      type="text"
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-1 w-full"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="mt-1 flex gap-2">
                      <Select defaultValue="+251">
                        <SelectTrigger className="w-1/4">
                          <SelectValue placeholder="+251" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+251">+251 (Ethiopia)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-3/4"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="portfolio">Portfolio/Website</Label>
                    <Input
                      type="url"
                      id="portfolio"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                      className="mt-1 w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      type="text"
                      id="profession"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="mt-1 w-full"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="careerLevel">Career Level</Label>
                    <Select onValueChange={setCareerLevel} value={careerLevel}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select career level" />
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
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaBookOpen className="mr-2 h-6 w-6 text-green-600" />
                  Cover Letter
                </h2>
                <Textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full"
                  rows={4}
                  required
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaBriefcase className="mr-2 h-6 w-6 text-green-600" />
                  Work Experience
                </h2>
                {experiences.map((experience, index) => (
                  <div key={index} className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`jobTitle-${index}`}>Job Title</Label>
                        <Input
                          type="text"
                          id={`jobTitle-${index}`}
                          name="jobTitle"
                          value={experience.jobTitle}
                          onChange={(e) => handleInputChange(e, index)}
                          className="mt-1 w-full"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`company-${index}`}>Company Name</Label>
                        <Input
                          type="text"
                          id={`company-${index}`}
                          name="company_name"
                          value={experience.company_name}
                          onChange={(e) => handleInputChange(e, index)}
                          className="mt-1 w-full"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`location-${index}`}>Location</Label>
                      <Input
                        type="text"
                        id={`location-${index}`}
                        name="location"
                        value={experience.location}
                        onChange={(e) => handleInputChange(e, index)}
                        className="mt-1 w-full"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`responsibilities-${index}`}>
                        Responsibilities and Achievements
                      </Label>
                      <Textarea
                        id={`responsibilities-${index}`}
                        name="responsibilities"
                        value={experience.responsibilities}
                        onChange={(e) => handleInputChange(e, index)}
                        className="mt-1 w-full"
                        rows={4}
                        required
                      />
                    </div>
                    {experiences.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newExperiences = [...experiences];
                          newExperiences.splice(index, 1);
                          setExperiences(newExperiences);
                        }}
                        className="text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={addExperience}
                    className="flex items-center text-green-600 hover:underline"
                  >
                    <FiPlus className="mr-2" /> Add Experience
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaGraduationCap className="mr-2 h-6 w-6 text-green-600" />
                  Education
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="degree">Degree Type</Label>
                    <Select onValueChange={setDegreeType} value={degreeType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select degree type" />
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
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      type="text"
                      id="institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="mt-1 w-full"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="graduationDate">Graduation Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <FaCalendar className="mr-2 h-4 w-4" />
                          {graduationDate ? (
                            format(graduationDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={graduationDate}
                          onSelect={setGraduationDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaCode className="mr-2 h-6 w-6 text-green-600" />
                  Skills
                </h2>
                <div className="space-y-2">
                  {skills.map((skill, index) => (
                    <Input
                      key={index}
                      type="text"
                      placeholder={`Skill ${index + 1}`}
                      value={skill}
                      onChange={(e) => {
                        const newSkills = [...skills];
                        newSkills[index] = e.target.value;
                        setSkills(newSkills);
                      }}
                      className="w-full"
                    />
                  ))}
                  {skills.length < 5 && (
                    <Button
                      type="button"
                      onClick={handleAddSkill}
                      variant="outline"
                    >
                      Add Skill
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaAward className="mr-2 h-6 w-6 text-green-600" />
                  Certifications
                </h2>
                <div className="space-y-2">
                  {certifications.map((certification, index) => (
                    <Input
                      key={index}
                      type="text"
                      placeholder={`Certification ${index + 1}`}
                      value={certification}
                      onChange={(e) => {
                        const newCertifications = [...certifications];
                        newCertifications[index] = e.target.value;
                        setCertifications(newCertifications);
                      }}
                      className="w-full"
                    />
                  ))}
                  {certifications.length < 5 && (
                    <Button
                      type="button"
                      onClick={handleAddCertification}
                      variant="outline"
                    >
                      Add Certification
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaLanguage className="mr-2 h-6 w-6 text-green-600" />
                  Languages
                </h2>
                <div className="space-y-2">
                  {languages.map((language, index) => (
                    <Input
                      key={index}
                      type="text"
                      placeholder={`Language ${index + 1}`}
                      value={language}
                      onChange={(e) => {
                        const newLanguages = [...languages];
                        newLanguages[index] = e.target.value;
                        setLanguages(newLanguages);
                      }}
                      className="w-full"
                    />
                  ))}
                  {languages.length < 5 && (
                    <Button
                      type="button"
                      onClick={handleAddLanguage}
                      variant="outline"
                    >
                      Add Language
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaCode className="mr-2 h-6 w-6 text-green-600" />
                  Projects
                </h2>
                <Textarea
                  id="projects"
                  value={projects}
                  onChange={(e) => setProjects(e.target.value)}
                  className="w-full"
                  rows={4}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaHandHoldingHeart className="mr-2 h-6 w-6 text-green-600" />
                  Volunteer Work
                </h2>
                <Textarea
                  id="volunteerWork"
                  value={volunteerWork}
                  onChange={(e) => setVolunteerWork(e.target.value)}
                  className="w-full"
                  rows={4}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaFileAlt className="mr-2 h-6 w-6 text-green-600" />
                  Upload Resume
                </h2>
                <Input
                  type="file"
                  id="resume"
                  accept="application/pdf"
                  onChange={handleResumeChange}
                  className="w-full"
                  required
                />
                {isUploading && (
                  <div className="flex items-center mt-2">
                    <Loader2 className="w-5 h-5 animate-spin text-green-600 mr-2" />
                    <span>Uploading resume...</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={hasApplied || isUploading}
                >
                  {hasApplied
                    ? "Already Applied"
                    : isUploading
                    ? "Uploading..."
                    : "Submit Application"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
