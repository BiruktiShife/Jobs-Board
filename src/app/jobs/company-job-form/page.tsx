"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
      companyId: job.companyId, // Retain companyId
      logo: job.logo, // Retain logo
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
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-green-300">
      <Card className="max-w-5xl mx-auto p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">
            Create Job Posting (Company)
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
              <Label htmlFor="area" className="ml-2 mb-1">
                Industry Area
              </Label>
              <Input
                id="area"
                name="area"
                value={job.area}
                onChange={handleInput}
              />
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
    return <div>Loading...</div>;
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
