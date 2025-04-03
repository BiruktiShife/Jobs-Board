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
import Image from "next/image";
import { Input } from "./ui/input";

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
}

export function HomeSection() {
  const categories: Category[] = [
    { icon: <FaLaptopCode className="w-6 h-6" />, title: "Programming" },
    { icon: <FaBriefcase className="w-6 h-6" />, title: "Business" },
    { icon: <FaStethoscope className="w-6 h-6" />, title: "Healthcare" },
    { icon: <FaGraduationCap className="w-6 h-6" />, title: "Education" },
    { icon: <FaLaptopCode className="w-6 h-6" />, title: "Fashion Design" },
    { icon: <FaBriefcase className="w-6 h-6" />, title: "Finance" },
    { icon: <FaStethoscope className="w-6 h-6" />, title: "Engineering" },
    { icon: <FaGraduationCap className="w-6 h-6" />, title: "Sales" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (currentIndex < categories.length - 3) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await response.json();
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

  const handleCategoryClick = async (category: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/jobs/catagory?area=${encodeURIComponent(category)}`
      );
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error("Failed to fetch jobs for category");
      }
      const data = await response.json();
      console.log("Fetched jobs:", data);
      setFilteredJobs(data);
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setError(`Failed to load jobs for ${category}`);
      setLoading(false);
    }
  };

  if (loading) return <p>Loading job details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col min-h-screen">
      <section
        className="flex flex-col gap-24 md:flex-row items-center justify-between py-20 relative"
        style={{
          backgroundImage: 'url("/bg.JPG")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-white/75 md:bg-gray-100/75"></div>
        <div className="w-full md:w-1/2 px-6 text-center md:text-left ml-12 relative z-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find Your Dream Job Today!
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Join thousands of candidates and employers on JobBoard.
          </p>
          <div className="w-full max-w-2xl">
            <div className="flex items-center bg-white shadow-md rounded-lg p-4 gap-3 w-full max-w-xl">
              <Input
                type="text"
                placeholder="Search for jobs..."
                className="flex-grow border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-600 rounded-lg px-4 py-2 text-gray-700"
              />
              <Button className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition">
                Search
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 px-6 mt-8 md:mt-0 relative z-10">
          <Image src="/image.png" alt="Sample Image" width={250} height={200} />
        </div>
      </section>

      <section className="container mx-auto relative mt-6">
        <h2 className="text-3xl font-bold text-center mb-8">Jobs Category</h2>
        <div className="relative overflow-hidden">
          <button
            onClick={handlePrevious}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-1 rounded-full shadow-lg z-10 hover:bg-gray-100 ${
              currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={currentIndex === 0}
          >
            <FaChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div
            ref={containerRef}
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
          >
            {categories.map((category: Category, index: number) => (
              <div key={index} className="flex-shrink-0 w-1/3 p-2">
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
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-1 rounded-full shadow-lg z-10 hover:bg-gray-100 ${
              currentIndex >= categories.length - 3
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={currentIndex >= categories.length - 3}
          >
            <FaChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Jobs by Category
        </h2>
        {!loading && !error && filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} jobData={job} />
            ))}
          </div>
        ) : (
          !loading && !error && <p>No jobs found for this category.</p>
        )}
      </section>
    </div>
  );
}
