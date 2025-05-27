"use client";

import JobCard from "@/utils/jobCard";
import {
  FaLaptopCode,
  FaBriefcase,
  FaStethoscope,
  FaGraduationCap,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { CategoryCard } from "@/utils/CategoryCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";

type Category = {
  icon: React.ReactNode;
  title: string;
};

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

interface HomeSectionProps {
  recommendedJobs: Job[];
  userRole?: string;
}

const JobCardSkeleton = () => {
  return (
    <div className="p-4 sm:p-6 border rounded-lg shadow-sm bg-white w-full">
      <div className="flex items-center gap-3 sm:gap-4">
        <Skeleton className="w-10 sm:w-12 h-10 sm:h-12 rounded-full" />
        <div className="space-y-1 sm:space-y-2">
          <Skeleton className="h-3 sm:h-4 w-[150px] sm:w-[200px]" />
          <Skeleton className="h-3 sm:h-4 w-[100px] sm:w-[150px]" />
        </div>
      </div>
      <Skeleton className="h-3 sm:h-4 w-[200px] sm:w-[250px] mt-3 sm:mt-4" />
      <Skeleton className="h-3 sm:h-4 w-[150px] sm:w-[200px] mt-1 sm:mt-2" />
      <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2">
        <Skeleton className="h-3 sm:h-4 w-full" />
        <Skeleton className="h-3 sm:h-4 w-3/4" />
      </div>
      <Skeleton className="h-8 sm:h-10 w-[80px] sm:w-[100px] mt-3 sm:mt-4" />
    </div>
  );
};

export function HomeSection({ recommendedJobs, userRole }: HomeSectionProps) {
  const categories: Category[] = [
    {
      icon: <FaLaptopCode className="w-5 sm:w-6 h-5 sm:h-6" />,
      title: "Programming",
    },
    {
      icon: <FaBriefcase className="w-5 sm:w-6 h-5 sm:h-6" />,
      title: "Business",
    },
    {
      icon: <FaStethoscope className="w-5 sm:w-6 h-5 sm:h-6" />,
      title: "Healthcare",
    },
    {
      icon: <FaGraduationCap className="w-5 sm:w-6 h-5 sm:h-6" />,
      title: "Education",
    },
    {
      icon: <FaLaptopCode className="w-5 sm:w-6 h-5 sm:h-6" />,
      title: "Fashion Design",
    },
    {
      icon: <FaBriefcase className="w-5 sm:w-6 h-5 sm:h-6" />,
      title: "Finance",
    },
    {
      icon: <FaStethoscope className="w-5 sm:w-6 h-5 sm:h-6" />,
      title: "Engineering",
    },
    {
      icon: <FaGraduationCap className="w-5 sm:w-6 h-5 sm:h-6" />,
      title: "Sales",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await response.json();
        const sortedData = data.sort(
          (a: Job, b: Job) =>
            new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );
        setJobs(sortedData);
        setFilteredJobs(sortedData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load jobs");
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = selectedCategory
      ? jobs.filter(
          (job) => job.area.toLowerCase() === selectedCategory.toLowerCase()
        )
      : jobs;

    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered = filtered.sort(
      (a, b) =>
        new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );

    setFilteredJobs(filtered);
  }, [searchQuery, jobs, selectedCategory]);

  const handleCategoryClick = async (category: string) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedCategory(category);

      const response = await fetch(
        `/api/jobs/catagory?area=${encodeURIComponent(category)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch jobs for category");
      }
      const data = await response.json();
      const sortedData = data.sort(
        (a: Job, b: Job) =>
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      );
      setJobs(sortedData);
      setFilteredJobs(
        searchQuery
          ? sortedData.filter(
              (job: Job) =>
                job.company_name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                job.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : sortedData
      );
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setError(`Failed to load jobs for ${category}`);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < categories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSearch = () => {
    let filtered = selectedCategory
      ? jobs.filter(
          (job) => job.area.toLowerCase() === selectedCategory.toLowerCase()
        )
      : jobs;

    filtered = filtered.filter(
      (job) =>
        job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered = filtered.sort(
      (a, b) =>
        new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );

    setFilteredJobs(filtered);
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <section
        className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 py-2 sm:py-4 md:py-6 items-center justify-between relative mt-0"
        style={{
          backgroundImage: 'url("/bg.JPG")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-white/80 sm:bg-gray-100/75"></div>
        <div className="w-full md:w-1/2 px-4 sm:px-6 text-center md:text-left ml-0 sm:ml-12 relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Find Your Dream Job Today!
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8">
            Join thousands of candidates and employers on JobBoard.
          </p>
        </div>
        <div className="w-full md:w-1/2 px-4 sm:px-6 mt-2 sm:mt-4 md:mt-0 relative z-10 flex flex-col items-center">
          <Image
            src="/image.png"
            alt="Sample Image"
            width={160}
            height={128}
            className="w-40 sm:w-60 md:w-80 h-auto mx-auto"
          />
          <div className="w-full max-w-full sm:max-w-lg md:max-w-2xl mx-auto mt-2 sm:mt-4">
            <div className="relative flex items-center bg-white p-1 sm:p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <svg
                className="w-5 sm:w-6 h-5 sm:h-6 text-gray-400 ml-2 sm:ml-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Input
                type="text"
                placeholder="Search by company name or job title..."
                className="flex-grow border-none py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                className="bg-green-600 text-white hover:bg-green-700 px-4 sm:px-6 py-1 sm:py-2 rounded-md whitespace-nowrap transition-colors duration-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {userRole !== "ADMIN" && (
        <section className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:hidden">
          <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
            Recommended Jobs
          </h2>
          <div className="space-y-2 sm:space-y-4">
            {recommendedJobs.length > 0 ? (
              recommendedJobs.map((job) => (
                <JobCard key={job.id} jobData={job} className="w-full" />
              ))
            ) : (
              <p className="text-gray-600 text-xs sm:text-base">
                No recommended jobs match your study area yet.
              </p>
            )}
          </div>
        </section>
      )}

      <section className="container mx-auto relative mt-4 sm:mt-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8">
          Jobs Category
        </h2>
        <div className="relative overflow-hidden">
          <button
            onClick={handlePrevious}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 sm:p-3 rounded-full shadow-lg z-10 hover:bg-gray-100 ${
              currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={currentIndex === 0}
          >
            <FaChevronLeft className="w-5 sm:w-6 h-5 sm:h-6 text-gray-600" />
          </button>
          <div
            ref={containerRef}
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {categories.map((category: Category, index: number) => (
              <div
                key={index}
                className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 p-2 sm:p-3"
              >
                <CategoryCard
                  icon={category.icon}
                  title={category.title}
                  onCategoryClick={handleCategoryClick}
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleNext}
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 sm:p-3 rounded-full shadow-lg z-10 hover:bg-gray-100 ${
              currentIndex >= categories.length - 1
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={currentIndex >= categories.length - 1}
          >
            <FaChevronRight className="w-5 sm:w-6 h-5 sm:h-6 text-gray-600" />
          </button>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8">
          Jobs
        </h2>
        {loading ? (
          <div
            className="grid lg:grid-cols-3 sm:grid-cols-1 gap-4 sm:gap-6 jobs-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(250px, 1fr)) !important",
            }}
          >
            {[...Array(3)].map((_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm sm:text-base">{error}</p>
        ) : filteredJobs.length > 0 ? (
          <div
            className="grid sm:grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 jobs-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(250px, 1fr)) !important",
            }}
          >
            {filteredJobs.map((job) => (
              <JobCard key={job.id} jobData={job} className="w-full" />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 text-sm sm:text-base">
            No jobs found matching your search or category.
          </p>
        )}
      </section>
    </div>
  );
}
