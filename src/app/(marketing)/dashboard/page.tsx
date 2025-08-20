"use client";

import JobCard from "@/utils/jobCard";
import { Profile } from "@/components/header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Grid,
  List,
  Building,
  Code,
  Briefcase,
  Heart,
  GraduationCap,
  Palette,
  DollarSign,
  Wrench,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Job {
  id: string;
  title: string;
  area: string;
  company_name: string;
  logo: string;
  about_job: string;
  location: string;
  deadline: string;
  site: string;
  qualifications: string[];
  responsibilities: string[];
  requiredSkills: string[];
  postedDate: string;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  paginate,
}: {
  currentPage: number;
  totalPages: number;
  paginate: (page: number) => void;
}) => (
  <div className="flex justify-center items-center space-x-2 mt-4">
    <button
      onClick={() => paginate(currentPage - 1)}
      disabled={currentPage === 1}
      className={`px-3 py-1 rounded ${
        currentPage === 1
          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
          : "bg-green-500 text-white hover:bg-green-600"
      }`}
    >
      Previous
    </button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
      <button
        key={number}
        onClick={() => paginate(number)}
        className={`px-3 py-1 rounded ${
          currentPage === number
            ? "bg-green-600 text-white"
            : "bg-gray-200 hover:bg-green-100"
        }`}
      >
        {number}
      </button>
    ))}
    <button
      onClick={() => paginate(currentPage + 1)}
      disabled={currentPage === totalPages}
      className={`px-3 py-1 rounded ${
        currentPage === totalPages
          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
          : "bg-green-500 text-white hover:bg-green-600"
      }`}
    >
      Next
    </button>
  </div>
);

// Categories data
const categories = [
  { icon: Code, title: "Programming", color: "bg-blue-500" },
  { icon: Briefcase, title: "Business", color: "bg-green-500" },
  { icon: Heart, title: "Healthcare", color: "bg-red-500" },
  { icon: GraduationCap, title: "Education", color: "bg-purple-500" },
  { icon: Palette, title: "Fashion Design", color: "bg-pink-500" },
  { icon: DollarSign, title: "Finance", color: "bg-yellow-500" },
  { icon: Wrench, title: "Engineering", color: "bg-gray-500" },
  { icon: TrendingUp, title: "Sales", color: "bg-indigo-500" },
];

export default function Dashboard() {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recommendedPage, setRecommendedPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const jobsPerPage = 6;
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (
      status === "authenticated" &&
      !["ADMIN", "JOB_SEEKER"].includes(session.user?.role || "")
    ) {
      router.push("/unauthorized");
    }
  }, [status, session, router]);

  // Filter jobs based on category and search
  useEffect(() => {
    let filtered = selectedCategory
      ? allJobs.filter(
          (job) => job.area.toLowerCase() === selectedCategory.toLowerCase()
        )
      : allJobs;

    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [allJobs, selectedCategory, searchQuery]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        // Fetch all jobs
        const allJobsResponse = await fetch("/api/jobs");
        if (!allJobsResponse.ok) throw new Error("Failed to fetch all jobs");
        const allJobsData = await allJobsResponse.json();
        setAllJobs(allJobsData);
        setFilteredJobs(allJobsData);

        // Fetch recommended jobs if user is JOB_SEEKER
        if (session?.user?.role === "JOB_SEEKER") {
          const recommendedResponse = await fetch("/api/jobs/recommended-jobs");
          if (!recommendedResponse.ok)
            throw new Error("Failed to fetch recommended jobs");
          const recommendedData = await recommendedResponse.json();
          setRecommendedJobs(recommendedData);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError(err instanceof Error ? err.message : "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchJobs();
    }
  }, [status, session]);

  // Category click handler
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    setCurrentPage(1);
  };

  // Search handler
  const handleSearch = () => {
    // The filtering is handled by useEffect, so we just need to trigger it
    setCurrentPage(1);
  };

  if (!session || !session.user.email) {
    return null;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-3 sm:p-8">
        <p className="text-red-500 text-xs sm:text-base">{error}</p>
      </div>
    );
  }

  // Calculate pagination for main jobs section
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Calculate pagination for recommended section
  const indexOfLastRecommended = recommendedPage * jobsPerPage;
  const indexOfFirstRecommended = indexOfLastRecommended - jobsPerPage;
  const currentRecommendedJobs = recommendedJobs.slice(
    indexOfFirstRecommended,
    indexOfLastRecommended
  );
  const totalRecommendedPages = Math.ceil(recommendedJobs.length / jobsPerPage);

  const showSplitLayout =
    recommendedJobs.length >= 5 && session?.user?.role === "JOB_SEEKER";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JB</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  JobBoard
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {session?.user?.role !== "ADMIN" ? (
                <Link
                  href="/job-seeker"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                >
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/admin"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                >
                  <span>Admin</span>
                </Link>
              )}
              <Profile email={session.user.email} />
            </div>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!showSplitLayout ? (
            <div className="space-y-8">
              {/* Hero Section */}
              <div className="text-center py-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  Discover Your Dream Job
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                  Explore thousands of opportunities from top companies. Find
                  the perfect role that matches your skills and aspirations.
                </p>

                {/* Recommended Jobs Notification */}
                {session?.user?.role === "JOB_SEEKER" &&
                  recommendedJobs.length > 0 &&
                  recommendedJobs.length < 5 && (
                    <div className="max-w-2xl mx-auto mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Search className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="text-sm font-medium text-blue-900">
                              {recommendedJobs.length} Recommended Job
                              {recommendedJobs.length !== 1 ? "s" : ""} Found
                            </h3>
                            <p className="text-sm text-blue-700">
                              We found jobs matching your study area! The
                              recommended jobs section will appear when you have
                              5 or more matches.
                            </p>
                          </div>
                          <Link href="/profile">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Update Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-8">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        placeholder="Search jobs, companies, or keywords..."
                        className="pl-10 h-12 text-lg border-gray-300 focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      />
                    </div>
                    <Button
                      className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleSearch}
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Search Jobs
                    </Button>
                  </div>
                </div>

                {/* Categories Section */}
                <div className="max-w-6xl mx-auto mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    Browse by Category
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                    {categories.map((category, index) => {
                      const IconComponent = category.icon;
                      const isSelected = selectedCategory === category.title;
                      return (
                        <button
                          key={index}
                          onClick={() => handleCategoryClick(category.title)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? `${category.color} text-white border-transparent shadow-lg`
                              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <IconComponent className="h-6 w-6 mx-auto mb-2" />
                          <span className="text-xs font-medium">
                            {category.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedCategory && (
                    <div className="text-center mt-4">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        Showing {filteredJobs.length} jobs in {selectedCategory}
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ✕
                        </button>
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedCategory || searchQuery
                        ? filteredJobs.length
                        : allJobs.length}
                      +
                    </div>
                    <div className="text-gray-600">
                      {selectedCategory || searchQuery
                        ? "Matching Jobs"
                        : "Active Jobs"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      500+
                    </div>
                    <div className="text-gray-600">Companies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">
                      10K+
                    </div>
                    <div className="text-gray-600">Success Stories</div>
                  </div>
                </div>
              </div>

              {/* Jobs Section */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedCategory
                        ? `${selectedCategory} Jobs`
                        : searchQuery
                          ? "Search Results"
                          : "Latest Opportunities"}
                    </h2>
                    <p className="text-gray-600">
                      {selectedCategory || searchQuery
                        ? `Found ${filteredJobs.length} matching jobs`
                        : "Discover jobs that match your skills and interests"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      className="hidden sm:flex items-center space-x-2"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filters</span>
                    </Button>
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white shadow-sm"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentJobs.map((job) => (
                    <JobCard key={job.id} jobData={job} className="w-full" />
                  ))}
                </div>

                {allJobs.length > 0 && (
                  <div className="mt-8">
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      paginate={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Split Layout with Recommendations */}
              <div className="text-center py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Jobs Tailored For You
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Based on your profile and preferences, we&apos;ve curated the
                  best opportunities for your career growth.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Jobs Section */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                          <span className="text-xl font-bold text-gray-900">
                            All Jobs
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {filteredJobs.length} available
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 gap-6">
                        {currentJobs.map((job) => (
                          <JobCard
                            key={job.id}
                            jobData={job}
                            className="w-full"
                          />
                        ))}
                      </div>
                      <div className="mt-6">
                        <PaginationControls
                          currentPage={currentPage}
                          totalPages={totalPages}
                          paginate={setCurrentPage}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommended Jobs Sidebar */}
                <div className="space-y-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                      <CardTitle className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Search className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          Recommended
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {recommendedJobs.length > 0 ? (
                        <div className="space-y-4">
                          {currentRecommendedJobs.map((job) => (
                            <JobCard
                              key={job.id}
                              jobData={job}
                              className="w-full"
                            />
                          ))}
                          <PaginationControls
                            currentPage={recommendedPage}
                            totalPages={totalRecommendedPages}
                            paginate={setRecommendedPage}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                            <Search className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-600 text-sm">
                            No recommended jobs match your study area yet.
                            Update your profile for better matches!
                          </p>
                          <Link href="/profile" className="mt-4 inline-block">
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Update Profile
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
