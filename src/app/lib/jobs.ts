import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type JobInput = {
  title: string;
  company: string;
  logo: string;
  area: string;
  location: string;
  deadline: string;
  site: "Full-time" | "Part-time" | "Freelance";
  about_job: string;
  qualifications: string[];
  responsibilities: string[];
  requiredSkills: string[];
};

export const createJob = async (jobData: JobInput) => {
  const mappedSite =
    jobData.site === "Full-time"
      ? "Full_time"
      : jobData.site === "Part-time"
      ? "Part_time"
      : "Freelance";

  const newJob = await prisma.job.create({
    data: {
      title: jobData.title,
      company: jobData.company,
      logo: jobData.logo,
      area: jobData.area,
      location: jobData.location,
      deadline: new Date(jobData.deadline),
      site: mappedSite,
      about_job: jobData.about_job,
      qualifications: {
        create: jobData.qualifications.map((q: string) => ({ value: q })),
      },
      responsibilities: {
        create: jobData.responsibilities.map((r: string) => ({ value: r })),
      },
      requiredSkills: {
        create: jobData.requiredSkills.map((s: string) => ({ value: s })),
      },
    },
  });
  return newJob;
};
