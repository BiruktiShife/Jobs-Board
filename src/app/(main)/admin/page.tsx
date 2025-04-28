"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { CustomTable } from "@/components/table";
import { BsPlusCircle } from "react-icons/bs";
import { FiBriefcase, FiUser } from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input"; // Assuming Input component from UI library

import type { ColumnName } from "@/components/table";

interface Job {
  id: string;
  title: string;
  company: string;
  postedDate: string;
  applications: number;
}

interface Applicant {
  id: string;
  name: string;
  jobId: string;
  jobTitle: string;
  company: string;
  email: string;
  appliedOn: string;
}

interface Company {
  name: string;
  adminEmail: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"jobs" | "companies">("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicantsForJob, setShowApplicantsForJob] = useState<
    string | null
  >(null);
  const [dataWarning, setDataWarning] = useState<string | null>(null);
  const [titleFilter, setTitleFilter] = useState<string>(""); // Filter for job title
  const [companyFilter, setCompanyFilter] = useState<string>(""); // Filter for job company
  const [nameFilter, setNameFilter] = useState<string>(""); // New filter for company name
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setDataWarning(null);

      try {
        if (activeTab === "jobs") {
          const [jobsResponse, applicantsResponse] = await Promise.all([
            fetch("/api/jobs/all-for-admin"),
            fetch("/api/applications/all-for-admin"),
          ]);

          if (!jobsResponse.ok) throw new Error("Failed to fetch jobs");
          if (!applicantsResponse.ok)
            throw new Error("Failed to fetch applicants");

          const jobsData = await jobsResponse.json();
          const rawApplicantsData = await applicantsResponse.json();

          console.log("Jobs Data:", jobsData);
          console.log("Raw Applicants Data:", rawApplicantsData);

          const applicantsData = rawApplicantsData.map((app: any) => ({
            id: app.id || "",
            name: app.name || "",
            jobId: app.jobId || app.job?.id || "",
            jobTitle: app.jobTitle || app.job?.title || "",
            company: app.company || app.job?.company?.name || "",
            email: app.email || "",
            appliedOn: app.appliedOn || app.createdAt || "",
          }));

          console.log("Transformed Applicants Data:", applicantsData);

          const jobIds = new Set(jobsData.map((job: Job) => job.id));
          const applicantJobIds = new Set(
            applicantsData.map((app: Applicant) => app.jobId)
          );
          const hasMatchingJobIds = [...applicantJobIds].some((jobId) =>
            jobIds.has(jobId)
          );

          if (applicantsData.length > 0 && !hasMatchingJobIds) {
            console.warn(
              "No applicants link to any job IDs. Job IDs:",
              [...jobIds],
              "Applicant Job IDs:",
              [...applicantJobIds]
            );
            setDataWarning(
              "No applicants are linked to any jobs. Please check the backend data."
            );
          }

          setJobs(jobsData);
          setApplicants(applicantsData);
        } else if (activeTab === "companies") {
          const response = await fetch("/api/companies/all-for-admin");
          if (!response.ok) throw new Error("Failed to fetch companies");
          const data = await response.json();
          setCompanies(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.user.role === "ADMIN") {
      fetchData();
    }
  }, [activeTab, session, status]);

  const handleViewApplicants = (jobId: string) => {
    setShowApplicantsForJob(jobId);
  };

  const handleBackToJobs = () => {
    setShowApplicantsForJob(null);
  };

  if (status === "loading")
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-4">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="text-gray-600">Loading session...</span>
        </div>
      </div>
    );

  if (!session || session.user.role !== "ADMIN")
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg max-w-md text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>You must be an admin to view this page.</p>
        </div>
      </div>
    );

  const handleAddJob = () => {
    console.log("Add Job button clicked!");
  };

  const AddButton = ({ onClick }: { onClick: () => void }) => {
    return (
      <div className="flex gap-4">
        {activeTab === "companies" && (
          <Link href="/create-company">
            <button
              className="flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white font-medium px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 fixed top-8 right-8 z-10"
              onClick={onClick}
            >
              <BsPlusCircle className="w-5 h-5 mr-2" />
              Add Company
            </button>
          </Link>
        )}
        {activeTab === "jobs" && (
          <>
            {showApplicantsForJob ? (
              <button
                onClick={handleBackToJobs}
                className="flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white font-medium px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 fixed top-8 right-8 z-10"
              >
                Back to Jobs
              </button>
            ) : (
              <Link href="/jobs/job-form">
                <button
                  className="flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white font-medium px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 fixed top-8 right-8 z-10"
                  onClick={onClick}
                >
                  <BsPlusCircle className="w-5 h-5 mr-2" />
                  Add Job
                </button>
              </Link>
            )}
          </>
        )}
      </div>
    );
  };

  const JobsSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center bg-gray-50 p-4 rounded-lg">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-8 flex-1 mx-2" />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center bg-white p-4 rounded-lg shadow-sm"
        >
          <Skeleton className="h-10 flex-1 mx-2" />
          <Skeleton className="h-10 w-32 mx-2" />
          <Skeleton className="h-10 w-24 mx-2" />
        </div>
      ))}
    </div>
  );

  const CompaniesSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center bg-gray-50 p-4 rounded-lg">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-8 flex-1 mx-2" />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center bg-white p-4 rounded-lg shadow-sm"
        >
          <Skeleton className="h-10 flex-1 mx-2" />
          <Skeleton className="h-10 flex-1 mx-2" />
        </div>
      ))}
    </div>
  );

  const filteredApplicants = showApplicantsForJob
    ? applicants.filter((applicant) => {
        console.log(
          "Filtering applicant jobId:",
          applicant.jobId,
          "for job:",
          showApplicantsForJob
        );
        return applicant.jobId === showApplicantsForJob;
      })
    : [];

  // Filter jobs based on title and company
  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(titleFilter.toLowerCase()) &&
      job.company.toLowerCase().includes(companyFilter.toLowerCase())
  );

  // Filter companies based on name
  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(nameFilter.toLowerCase())
  );

  console.log("Filtered Applicants:", filteredApplicants);

  return (
    <div className="flex min-h-screen relative bg-gray-50">
      <Sidebar<"jobs" | "companies">
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role="admin"
      />

      <main className="flex-1 p-8">
        <div className="mb-8">
          {activeTab === "jobs" && (
            <div className="flex items-center space-x-4">
              {showApplicantsForJob ? (
                <>
                  <div className="p-3 rounded-lg bg-green-100 text-green-600">
                    <FiUser className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      Applicants
                    </h1>
                    <p className="text-gray-600">Applicants for selected job</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-lg bg-green-100 text-green-600">
                    <FiBriefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      Job Listings
                    </h1>
                    <p className="text-gray-600">Manage all posted jobs</p>
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === "companies" && (
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <FaBuilding className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Companies</h1>
                <p className="text-gray-600">Manage registered companies</p>
              </div>
            </div>
          )}
        </div>

        {activeTab === "jobs" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {!showApplicantsForJob && (
              <div className="p-4 flex gap-4">
                <Input
                  placeholder="Filter by Title"
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                  className="max-w-xs"
                />
                <Input
                  placeholder="Filter by Company"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            )}
            {loading && <JobsSkeleton />}
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}
            {dataWarning && (
              <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {dataWarning}
              </div>
            )}
            {!loading && !error && !showApplicantsForJob && (
              <CustomTable
                data={filteredJobs}
                columns={["Title", "Posted Date", "Company", "Applications"]}
                onCellClick={(row: Job, column: ColumnName) => {
                  if (column === "Applications") {
                    handleViewApplicants(row.id);
                  }
                }}
              />
            )}
            {!loading && !error && showApplicantsForJob && (
              <div>
                {filteredApplicants.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-10 h-10 text-gray-400 mb-2" />
                      No applicants found for this job
                    </div>
                  </div>
                ) : (
                  <CustomTable
                    data={filteredApplicants}
                    columns={["Name", "Email", "Job Title", "Applied On"]}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "companies" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
              <Input
                placeholder="Filter by Name"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="max-w-xs"
              />
            </div>
            {loading && <CompaniesSkeleton />}
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}
            {!loading && !error && (
              <CustomTable
                data={filteredCompanies}
                columns={["Name", "Admin Email"]}
              />
            )}
          </div>
        )}
      </main>

      <AddButton onClick={handleAddJob} />
    </div>
  );
}
