"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BsPlus } from "react-icons/bs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

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
  companies: { id: string; name: string }[];
}

function JobForm({ onSubmit, companies }: JobFormProps) {
  const [job, setJob] = useState<Job>({
    title: "",
    companyId: companies[0]?.id || "",
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

  const [preview, setPreview] = useState<string | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJob({ ...job, [name]: value });
  };

  const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJob({ ...job, about_job: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setJob({ ...job, logo: `/${file.name}` });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    <div className="bg-gradient-to-br from-gray-50 to-green-300">
      <Card className="max-w-5xl mx-auto p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">
            Create Job Posting
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="title" className="ml-2 mb-1">
                Job Title
              </Label>
              <Input
                id="title"
                name="title"
                value={job.title}
                onChange={handleInput}
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="companyId" className="ml-2 mb-1">
                Company
              </Label>
              <Select
                onValueChange={(value) => setJob({ ...job, companyId: value })}
                value={job.companyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <Label htmlFor="area" className="ml-2 mb-1">
                Industry Area
              </Label>
              <Select
                onValueChange={(value) => setJob({ ...job, area: value })}
                value={job.area}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {industryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <Label htmlFor="location" className="ml-2 mb-1">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={job.location}
                onChange={handleInput}
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="deadline" className="ml-2 mb-1">
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

            <div className="mb-4">
              <Label htmlFor="site" className="ml-2 mb-1">
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
                    <SelectItem value="Full_time">Full-time</SelectItem>
                    <SelectItem value="Part_time">Part-time</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <Label htmlFor="logo">Company Logo</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {preview && (
                <div className="mb-4">
                  <Image
                    src={preview}
                    alt="Company Logo Preview"
                    className="w-32 h-32 object-cover rounded-md"
                    width={128}
                    height={128}
                  />
                </div>
              )}
            </div>

            <Label htmlFor="about_job" className="ml-2 mb-1">
              About the Job
            </Label>
            <Textarea
              id="about_job"
              name="about_job"
              value={job.about_job}
              onChange={handleTextArea}
              rows={4}
              className="mb-2"
            />

            {(
              ["qualifications", "responsibilities", "requiredSkills"] as const
            ).map((field) => (
              <Card key={field} className="mb-4">
                <CardHeader>
                  <CardTitle>{field.replace(/([A-Z])/g, " $1")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {(job[field] as string[]).map((item, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <Input
                        value={item}
                        onChange={(e) => {
                          const newValues = [...(job[field] as string[])];
                          newValues[index] = e.target.value;
                          setJob({ ...job, [field]: newValues });
                        }}
                      />
                      {index > 0 && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeField(field, index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    type="button"
                    className="bg-green-600 hover:bg-green-500 text-white hover:text-white"
                    onClick={() => addField(field)}
                  >
                    <BsPlus className="mr-2" /> Add{" "}
                    {field.replace(/([A-Z])/g, " $1")}
                  </Button>
                </CardContent>
              </Card>
            ))}

            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              Post Job
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

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

export default function PostJob() {
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>(
    []
  );
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
    return <div>Loading companies...</div>;
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
