"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  FaLaptopCode,
  FaBriefcase,
  FaStethoscope,
  FaGraduationCap,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import JobCard from "@/utils/jobCard";
import { CategoryCard } from "@/utils/CategoryCard";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type Category = {
  icon: React.ReactNode;
  title: string;
};

interface Job {
  id: string;
  area: string;
  title: string;
  company_name: string;
  logo: string;
  about_job: string;
  location: string;
  deadline: string;
  site: string;
  qualifications: string[];
  responsibilities: string[];
  requiredSkills: string[];
}

export default function Home() {
  const categories: Category[] = [
    { icon: <FaLaptopCode className="w-8 h-8" />, title: "Programming" },
    { icon: <FaBriefcase className="w-8 h-8" />, title: "Business" },
    { icon: <FaStethoscope className="w-8 h-8" />, title: "Healthcare" },
    { icon: <FaGraduationCap className="w-8 h-8" />, title: "Education" },
    { icon: <FaLaptopCode className="w-8 h-8" />, title: "Design" },
    { icon: <FaBriefcase className="w-8 h-8" />, title: "Finance" },
    { icon: <FaStethoscope className="w-8 h-8" />, title: "Engineering" },
    { icon: <FaGraduationCap className="w-8 h-8" />, title: "Sales" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
        setJobs(data);
        setFilteredJobs(data);
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
      setJobs(data);
      setFilteredJobs(
        searchQuery
          ? data.filter(
              (job: Job) =>
                job.company_name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                job.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : data
      );
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setError(`Failed to load jobs for ${category}`);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < categories.length - 4) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSearch = () => {
    const filtered = selectedCategory
      ? jobs.filter(
          (job) => job.area.toLowerCase() === selectedCategory.toLowerCase()
        )
      : jobs;

    setFilteredJobs(
      filtered.filter(
        (job) =>
          job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="flex items-center justify-between bg-white shadow-md">
        <div className="flex items-center gap-0">
          <Image
            src="/logo.png"
            alt="logo"
            width={100}
            height={20}
            className="flex-shrink-0"
          />
          <span className="text-2xl font-bold text-green-600">JobBoard</span>
        </div>

        <div className="flex space-x-4 px-8">
          <Link href="/login">
            <Button variant="outline">Log In</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-green-600 text-white hover:bg-green-700">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      <section
        className="flex flex-col gap-24 md:flex-row items-center justify-between py-20 relative"
        style={{
          backgroundImage: 'url("/bg.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-white/75 md:bg-gray-100/75"></div>

        <div className="w-full md:w-1/2 px-6 text-center md:text-left ml-32 relative z-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find Your Dream Job Today!
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Join thousands of candidates and employers on JobBoard.
          </p>
          <div className="w-full max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <svg
                className="w-6 h-6 text-gray-400 ml-3"
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
                className="flex-grow border-none py-3 px-4 text-gray-700 placeholder-gray-400 focus-outline-none focus:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                className="bg-green-600 text-white hover:bg-green-700 px-6 py-2 rounded-md whitespace-nowrap transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 px-6 mt-8 md:mt-0 relative z-10">
          <Image src="/image.png" alt="Sample Image" width={250} height={200} />
        </div>
      </section>

      <section className="container mx-auto px-6 py-12 relative">
        <h2 className="text-3xl font-bold text-center mb-8">
          Browse Jobs by Category
        </h2>
        <div className="relative overflow-hidden">
          <button
            onClick={handlePrevious}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg z-10 hover:bg-gray-100 ${
              currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={currentIndex === 0}
          >
            <FaChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          <div
            ref={containerRef}
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 25}%)` }}
          >
            {categories.map((category, index) => (
              <div key={index} className="flex-shrink-0 w-1/4 p-2">
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
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg z-10 hover:bg-gray-100 ${
              currentIndex >= categories.length - 4
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={currentIndex >= categories.length - 4}
          >
            <FaChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">All Jobs</h2>
        {loading && (
          <div className="flex justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
          </div>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {filteredJobs.length === 0 ? (
              <p className="text-center text-gray-500">
                No jobs found matching your search or category.
              </p>
            ) : (
              filteredJobs.map((job) => <JobCard key={job.id} jobData={job} />)
            )}
          </div>
        )}
      </section>
    </div>
  );
}
