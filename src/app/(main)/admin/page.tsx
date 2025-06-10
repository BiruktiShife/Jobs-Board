"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { BsPlusCircle } from "react-icons/bs";
import { useSession } from "next-auth/react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartRevenue } from "@/components/chart-revenue";
import { ChartVisitors } from "@/components/chart-visitors";
import { ProductsTable } from "@/components/products-table";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Job, Applicant, Company, JobStatus } from "@/types";
import Link from "next/link";
import { Profile } from "@/components/header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "jobs" | "companies" | "pending-jobs"
  >("overview");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicantsForJob, setShowApplicantsForJob] = useState<
    string | null
  >(null);
  const [dataWarning, setDataWarning] = useState<string | null>(null);
  const [titleFilter, setTitleFilter] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [dateRange] = useState<{ from: Date; to: Date } | null>(null);
  const [statusFilter] = useState<JobStatus | "ALL">("ALL");
  const { data: session, status } = useSession();

  // Memoize the pending jobs count
  const pendingJobsCount = useMemo(
    () => jobs.filter((job) => job.status === "PENDING").length,
    [jobs]
  );

  const fetchData = useCallback(async () => {
    if (status !== "authenticated" || session?.user.role !== "ADMIN") return;

    setLoading(true);
    setError(null);
    setDataWarning(null);

    try {
      const [jobsResponse, applicantsResponse, companiesResponse] =
        await Promise.all([
          fetch("/api/jobs/all-for-admin"),
          fetch("/api/applications/all-for-admin"),
          fetch("/api/companies/all-for-admin"),
        ]);

      if (!jobsResponse.ok) throw new Error("Failed to fetch jobs");
      if (!applicantsResponse.ok) throw new Error("Failed to fetch applicants");
      if (!companiesResponse.ok) throw new Error("Failed to fetch companies");

      const jobsData = await jobsResponse.json();
      const rawApplicantsData = await applicantsResponse.json();
      const companiesData = await companiesResponse.json();

      const formattedJobs: Job[] = jobsData.map((job: Job) => ({
        id: job.id || "",
        title: job.title || "",
        company: job.company || "",
        companyId: job.companyId || "",
        logo: job.logo || "",
        area: job.area || "",
        location: job.location || "",
        deadline: job.deadline || "",
        site: job.site || "Full_time",
        about_job: job.about_job || "",
        qualifications: job.qualifications || [],
        responsibilities: job.responsibilities || [],
        requiredSkills: job.requiredSkills || [],
        postedDate: job.postedDate || "",
        applications: job.applications || 0,
        status: (job.status || "PENDING") as JobStatus,
      }));

      const applicantsData: Applicant[] = rawApplicantsData.map(
        (app: Applicant) => ({
          id: app.id || "",
          name: app.name || "",
          jobId: app.jobId || "",
          jobTitle: app.jobTitle || "",
          company: app.company || "",
          email: app.email || "",
          appliedOn: app.appliedOn || "",
        })
      );

      const formattedCompanies: Company[] = companiesData.map(
        (comp: Company) => ({
          id: comp.id || "",
          name: comp.name || "",
          adminEmail: comp.adminEmail || "",
        })
      );

      setJobs(formattedJobs);
      setApplicants(applicantsData);
      setCompanies(formattedCompanies);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error loading data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [session, status, fetchData]);

  // Refresh data when tab changes to pending-jobs
  useEffect(() => {
    if (activeTab === "pending-jobs") {
      fetchData();
    }
  }, [activeTab, fetchData]);

  // Add focus event listener to refresh data
  useEffect(() => {
    const handleFocus = () => {
      if (activeTab === "pending-jobs") {
        fetchData();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [activeTab, fetchData]);

  const handleViewApplicants = (jobId: string) => {
    setShowApplicantsForJob(jobId);
  };

  const handleBackToJobs = () => {
    setShowApplicantsForJob(null);
  };

  const getChartData = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const now = new Date();

    const filteredApplicants = dateRange
      ? applicants.filter((app) => {
          const appliedOn = new Date(app.appliedOn);
          return appliedOn >= dateRange.from && appliedOn <= dateRange.to;
        })
      : applicants;

    const applicationData = months.map((month, index) => {
      const monthStart = new Date(now.getFullYear(), index, 1);
      const monthEnd = new Date(now.getFullYear(), index + 1, 0);
      const count = filteredApplicants.filter((app) => {
        const appliedOn = new Date(app.appliedOn);
        return appliedOn >= monthStart && appliedOn <= monthEnd;
      }).length;
      return { month, applications: count };
    });

    const recentJobs = jobs
      .sort(
        (a, b) =>
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      )
      .slice(0, 5)
      .map((job, index) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        postedDate: job.postedDate,
        fill: `var(--chart-${index + 1})`,
      }));

    return { applicationData, recentJobs };
  };

  const { applicationData, recentJobs } = getChartData();
  const totalJobs = jobs.length;
  const totalCompanies = companies.length;
  const totalApplicants = applicants.length;
  const closedJobs = jobs.filter((job) => {
    const deadline = new Date(job.deadline);
    const currentDate = new Date();
    return deadline < currentDate;
  }).length;

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(titleFilter.toLowerCase()) &&
      job.company.toLowerCase().includes(companyFilter.toLowerCase())
  );

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(nameFilter.toLowerCase())
  );

  const filteredApplicants = showApplicantsForJob
    ? applicants.filter((applicant) => applicant.jobId === showApplicantsForJob)
    : [];

  const filteredByStatusJobs = filteredJobs.filter((job) => {
    if (statusFilter === "ALL") return true;
    return job.status === statusFilter;
  });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-4">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="text-gray-600">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg max-w-md text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>You must be an admin to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="@container/page flex flex-1 flex-col gap-8 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(
              value as "overview" | "jobs" | "companies" | "pending-jobs"
            )
          }
          className="gap-6 flex-1"
        >
          <div
            data-slot="dashboard-header"
            className="flex items-center justify-between w-full"
          >
            <TabsList className="w-full @3xl/page:w-fit">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="companies">Companies</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="pending-jobs" className="relative">
                Pending Jobs
                {pendingJobsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                    {pendingJobsCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <div className="hidden @3xl/page:flex items-center gap-4">
              <h1 className="text-2xl font-bold text-green-800">Dashboard</h1>
              <Profile email={session?.user?.email || ""} />
            </div>
          </div>
          <TabsContent value="overview" className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-800">Total Jobs</CardTitle>
                  <CardDescription>
                    {totalJobs.toLocaleString()} in the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Badge variant="outline">
                    <TrendingUp className="h-4 w-4 mr-1" />+
                    {getPercentageChange(totalJobs, totalJobs * 0.95)}%
                  </Badge>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-800">
                    Total Companies
                  </CardTitle>
                  <CardDescription>
                    {totalCompanies.toLocaleString()} Companies
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Badge variant="outline">
                    <TrendingDown className="h-4 w-4 mr-1" />-
                    {getPercentageChange(totalCompanies, totalCompanies * 1.05)}
                    %
                  </Badge>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-800">
                    Total Applicants
                  </CardTitle>
                  <CardDescription>
                    {totalApplicants.toLocaleString()} applicants
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Badge variant="outline">
                    <TrendingUp className="h-4 w-4 mr-1" />+
                    {getPercentageChange(
                      totalApplicants,
                      totalApplicants * 0.95
                    )}
                    %
                  </Badge>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-800">Closed Jobs</CardTitle>
                  <CardDescription>
                    {closedJobs.toLocaleString()} jobs closed
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Badge variant="outline">
                    <TrendingUp className="h-4 w-4 mr-1" />+
                    {getPercentageChange(closedJobs, closedJobs * 0.95)}%
                  </Badge>
                </CardFooter>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 @4xl/page:grid-cols-[2fr_1fr]">
              <ChartRevenue
                data={applicationData}
                dateRange={dateRange}
                totalApplicants={totalApplicants}
              />
              <ChartVisitors data={recentJobs} />
            </div>
          </TabsContent>
          <TabsContent value="jobs" className="flex flex-col gap-4">
            <ProductsTable
              type="jobs"
              jobs={filteredByStatusJobs}
              applicants={filteredApplicants}
              showApplicantsForJob={showApplicantsForJob}
              titleFilter={titleFilter}
              companyFilter={companyFilter}
              setTitleFilter={setTitleFilter}
              setCompanyFilter={setCompanyFilter}
              handleViewApplicants={handleViewApplicants}
              handleBackToJobs={handleBackToJobs}
              loading={loading}
              error={error}
              dataWarning={dataWarning}
            />
          </TabsContent>
          <TabsContent value="companies" className="flex flex-col gap-4">
            <ProductsTable
              type="companies"
              companies={filteredCompanies}
              nameFilter={nameFilter}
              setNameFilter={setNameFilter}
              loading={loading}
              error={error}
            />
          </TabsContent>
          <TabsContent value="pending-jobs">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Pending Jobs
                  </h2>
                  <p className="text-muted-foreground">
                    Review and approve job postings from companies
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  <p>{error}</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Posted Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {jobs
                        .filter((job) => job.status === "PENDING")
                        .map((job) => (
                          <tr key={job.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {job.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {job.company}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {job.postedDate}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={job.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link
                                href={`/jobs/job-form?id=${job.id}&mode=review`}
                              >
                                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                                  View Details
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-4 @3xl/page:hidden">
          <Profile email={session?.user?.email || ""} />
        </div>
      </div>

      {(activeTab === "jobs" || activeTab === "companies") && (
        <div className="fixed top-8 right-8 z-10">
          {activeTab === "companies" && (
            <Link href="/create-company">
              <button
                className="flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white font-medium px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => console.log("Add Company button clicked!")}
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
                  className="flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white font-medium px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Back to Jobs
                </button>
              ) : (
                <Link href="/jobs/job-form">
                  <button
                    className="flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white font-medium px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => console.log("Add Job button clicked!")}
                  >
                    <BsPlusCircle className="w-5 h-5 mr-2" />
                    Add Job
                  </button>
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
