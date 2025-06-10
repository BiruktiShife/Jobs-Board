export type JobStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  logo: string;
  area: string;
  location: string;
  deadline: string;
  site: "Full_time" | "Part_time" | "Freelance";
  about_job: string;
  qualifications: string[];
  responsibilities: string[];
  requiredSkills: string[];
  postedDate: string;
  applications: number;
  status: JobStatus;
}

export interface Applicant {
  id: string;
  name: string;
  jobId: string;
  jobTitle: string;
  company: string;
  email: string;
  appliedOn: string;
}

export interface Company {
  id: string;
  name: string;
  adminEmail: string;
}

export interface ChartData {
  month: string;
  applications: number;
}
