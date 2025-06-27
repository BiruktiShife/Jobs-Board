"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  Building2,
  ExternalLink,
  Loader2,
  Shield,
  Users,
  Briefcase,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  UserCheck,
  Building,
  Calendar,
  Activity,
  Target,
  Mail,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { ChartRevenue } from "@/components/chart-revenue";
import { ChartVisitors } from "@/components/chart-visitors";
import { ProductsTable } from "@/components/products-table";
import { Job, Applicant, Company, JobStatus } from "@/types";
import Link from "next/link";
import { Profile } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

type Companies = {
  id: string;
  name: string;
  adminEmail: string;
  address: string;
  logo: string;
  licenseUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "jobs" | "companies" | "pending-jobs" | "company-approvals"
  >("overview");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pendingCompanies, setPendingCompanies] = useState<Companies[]>([]); // Renamed for clarity
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
  const [processingId, setProcessingId] = useState<string | null>(null);

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
      const [
        jobsResponse,
        applicantsResponse,
        companiesResponse,
        pendingCompaniesResponse,
      ] = await Promise.all([
        fetch("/api/jobs/all-for-admin"),
        fetch("/api/applications/all-for-admin"),
        fetch("/api/companies/all-for-admin"),
        fetch("/api/companies?status=PENDING"), // Fetch pending companies
      ]);

      if (!jobsResponse.ok) throw new Error("Failed to fetch jobs");
      if (!applicantsResponse.ok) throw new Error("Failed to fetch applicants");
      if (!companiesResponse.ok) throw new Error("Failed to fetch companies");
      if (!pendingCompaniesResponse.ok)
        throw new Error("Failed to fetch pending companies");

      const jobsData = await jobsResponse.json();
      const rawApplicantsData = await applicantsResponse.json();
      const companiesData = await companiesResponse.json();
      const pendingCompaniesData = await pendingCompaniesResponse.json();

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

      const formattedPendingCompanies: Companies[] = pendingCompaniesData.map(
        (comp: Companies) => ({
          id: comp.id || "",
          name: comp.name || "",
          adminEmail: comp.adminEmail || "",
          address: comp.address || "",
          logo: comp.logo || "",
          licenseUrl: comp.licenseUrl || "",
          status: comp.status || "PENDING",
          createdAt: comp.createdAt || "",
        })
      );

      setJobs(formattedJobs);
      setApplicants(applicantsData);
      setCompanies(formattedCompanies);
      setPendingCompanies(formattedPendingCompanies);
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

  // Refresh data when tab changes to pending-jobs or company-approvals
  useEffect(() => {
    if (activeTab === "pending-jobs" || activeTab === "company-approvals") {
      fetchData();
    }
  }, [activeTab, fetchData]);

  // Add focus event listener to refresh data
  useEffect(() => {
    const handleFocus = () => {
      if (activeTab === "pending-jobs" || activeTab === "company-approvals") {
        fetchData();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [activeTab, fetchData]);

  const handleStatusUpdate = async (
    companyId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    setProcessingId(companyId);
    try {
      const response = await fetch(`/api/companies/${companyId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      toast.success(`Company ${status.toLowerCase()} successfully`);

      // Refresh data
      fetchData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update company status"
      );
    } finally {
      setProcessingId(null);
    }
  };

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

  if (status === "loading" || loading) {
    return (
      <Loading
        variant="page"
        text={
          status === "loading" ? "Authenticating..." : "Loading admin dashboard"
        }
        icon="users"
      />
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 max-w-md">
            You must be an administrator to access this dashboard. Please
            contact your system administrator if you believe this is an error.
          </p>
          <Link href="/">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Admin Header */}
        <div className="bg-white/80 rounded-2xl border border-white/20 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Admin Icon */}
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>

              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage platform operations and oversee system performance
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                    <UserCheck className="w-3 h-3 mr-1" />
                    Administrator
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Activity className="w-3 h-3 mr-1" />
                    System Active
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Profile email={session?.user?.email || ""} />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(
              value as
                | "overview"
                | "jobs"
                | "companies"
                | "pending-jobs"
                | "company-approvals"
            )
          }
          className="space-y-8"
        >
          <div className="bg-white/80 rounded-xl border border-white/20 p-2">
            <TabsList className="w-full bg-transparent">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="companies"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Building className="h-4 w-4 mr-2" />
                Companies
              </TabsTrigger>
              <TabsTrigger
                value="jobs"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Jobs
              </TabsTrigger>
              <TabsTrigger
                value="company-approvals"
                className="relative data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Company Approvals
                {pendingCompanies.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {pendingCompanies.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="pending-jobs"
                className="relative data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Clock className="h-4 w-4 mr-2" />
                Pending Jobs
                {pendingJobsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {pendingJobsCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="space-y-8">
            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Jobs
                      </p>
                      <p className="text-3xl font-bold text-purple-600">
                        {totalJobs.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">All time</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />+
                      {getPercentageChange(totalJobs, totalJobs * 0.95)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Companies
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {totalCompanies.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Registered</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200"
                    >
                      <TrendingDown className="h-3 w-3 mr-1" />-
                      {getPercentageChange(
                        totalCompanies,
                        totalCompanies * 1.05
                      )}
                      %
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Applicants
                      </p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {totalApplicants.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Job seekers</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />+
                      {getPercentageChange(
                        totalApplicants,
                        totalApplicants * 0.95
                      )}
                      %
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Closed Jobs
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        {closedJobs.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Expired</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />+
                      {getPercentageChange(closedJobs, closedJobs * 0.95)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                    Application Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ChartRevenue
                    data={applicationData}
                    dateRange={dateRange}
                    totalApplicants={totalApplicants}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Recent Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ChartVisitors data={recentJobs} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                  <Briefcase className="w-6 h-6 mr-3 text-purple-600" />
                  Job Management
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                  <Building className="w-6 h-6 mr-3 text-purple-600" />
                  Company Management
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ProductsTable
                  type="companies"
                  companies={filteredCompanies}
                  nameFilter={nameFilter}
                  setNameFilter={setNameFilter}
                  loading={loading}
                  error={error}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pending-jobs" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                      <Clock className="w-6 h-6 mr-3 text-purple-600" />
                      Pending Jobs
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      Review and approve job postings from companies
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    <Clock className="w-3 h-3 mr-1" />
                    {jobs.filter((job) => job.status === "PENDING").length}{" "}
                    pending
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {error ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-900 mb-1">Error</h4>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                ) : jobs.filter((job) => job.status === "PENDING").length ===
                  0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      All caught up!
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      No pending job approvals at the moment. All job postings
                      have been reviewed.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-white/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/80">
                          <TableHead className="font-semibold text-gray-700">
                            Job Title
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Company
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Posted Date
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Status
                          </TableHead>
                          <TableHead className="text-right font-semibold text-gray-700">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs
                          .filter((job) => job.status === "PENDING")
                          .map((job, index) => (
                            <TableRow
                              key={job.id}
                              className={`hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? "bg-white/50" : "bg-gray-50/30"}`}
                            >
                              <TableCell className="font-semibold text-gray-900">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold">{job.title}</p>
                                    <p className="text-sm text-gray-500">
                                      ID: {job.id.slice(0, 8)}...
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Building className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">
                                    {job.company}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">
                                    {job.postedDate}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {job.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Link
                                  href={`/jobs/job-form?id=${job.id}&mode=review`}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Review
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="company-approvals" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
                      <Building2 className="w-6 h-6 mr-3 text-purple-600" />
                      Company Approvals
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      Review and approve company registrations
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    <Building2 className="w-3 h-3 mr-1" />
                    {pendingCompanies.length} pending
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {pendingCompanies.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      All caught up!
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      No pending company approvals at the moment. All company
                      registrations have been reviewed.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-white/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/80">
                          <TableHead className="font-semibold text-gray-700">
                            Company
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Email
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Address
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Documents
                          </TableHead>
                          <TableHead className="font-semibold text-gray-700">
                            Created At
                          </TableHead>
                          <TableHead className="text-right font-semibold text-gray-700">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingCompanies.map((company, index) => (
                          <TableRow
                            key={company.id}
                            className={`hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? "bg-white/50" : "bg-gray-50/30"}`}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-3">
                                {company.logo ? (
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                                    <Image
                                      src={company.logo}
                                      alt={company.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-purple-600" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {company.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    ID: {company.id.slice(0, 8)}...
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">
                                  {company.adminEmail}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">
                                  {company.address}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <a
                                href={company.licenseUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-purple-600 hover:text-purple-800 font-medium"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View License
                              </a>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">
                                  {new Date(
                                    company.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleStatusUpdate(company.id, "APPROVED")
                                  }
                                  disabled={processingId === company.id}
                                  className="border-green-200 text-green-700 hover:bg-green-50"
                                >
                                  {processingId === company.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleStatusUpdate(company.id, "REJECTED")
                                  }
                                  disabled={processingId === company.id}
                                  className="border-red-200 text-red-700 hover:bg-red-50"
                                >
                                  {processingId === company.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </>
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
