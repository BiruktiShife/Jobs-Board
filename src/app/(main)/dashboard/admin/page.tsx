"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { CustomTable } from "@/components/table";
import { BsPlusCircle } from "react-icons/bs";
import { FiBriefcase, FiHome, FiUsers } from "react-icons/fi";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Job {
  id: string;
  title: string;
  posteddate: string;
  applications: number;
}

interface Applicant {
  id: string;
  name: string;
  job: string;
  status: string;
}

interface Company {
  name: string;
  adminEmail: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "jobs" | "applicants" | "companies"
  >("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (activeTab === "jobs") {
          const response = await fetch("/api/jobs/all-for-admin");
          if (!response.ok) throw new Error("Failed to fetch jobs");
          const data = await response.json();
          setJobs(data);
        } else if (activeTab === "applicants") {
          const response = await fetch("/api/applications/all-for-admin");
          if (!response.ok) throw new Error("Failed to fetch applicants");
          const data = await response.json();
          setApplicants(data);
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

  if (status === "loading") return <p>Loading session...</p>;
  if (!session || session.user.role !== "ADMIN")
    return <p>You must be an admin to view this page.</p>;

  const handleAddJob = () => {
    console.log("Add Job button clicked!");
  };

  const AddButton = ({ onClick }: { onClick: () => void }) => {
    return (
      <div className="flex gap-4">
        {activeTab === "companies" && (
          <Link href="/create-company">
            <button
              className="flex items-center justify-center bg-green-600 text-white font-medium px-4 py-2 rounded-md shadow-md hover:bg-green-700 transition duration-300 fixed top-8 right-8"
              onClick={onClick}
            >
              <BsPlusCircle className="w-6 h-6 mr-2" />
              Add Company
            </button>
          </Link>
        )}
        {activeTab === "jobs" && (
          <Link href="/jobs/job-form">
            <button
              className="flex items-center justify-center bg-green-600 text-white font-medium px-4 py-2 rounded-md shadow-md hover:bg-green-700 transition duration-300 fixed top-8 right-8"
              onClick={onClick}
            >
              <BsPlusCircle className="w-6 h-6 mr-2" />
              Add Job
            </button>
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen relative">
      <Sidebar<"jobs" | "applicants" | "companies">
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role="admin"
      />
      <main className="flex-1 p-8 bg-gray-100">
        <div className="mb-6 flex items-center">
          {activeTab === "jobs" && (
            <span className="flex items-center text-green-600 font-bold space-x-2">
              <FiBriefcase className="w-6 h-6" />
              <span>Jobs</span>
            </span>
          )}
          {activeTab === "applicants" && (
            <span className="flex items-center text-green-600 font-bold space-x-2">
              <FiUsers className="w-6 h-6" />
              <span>Applicants</span>
            </span>
          )}
          {activeTab === "companies" && (
            <span className="flex items-center text-green-600 font-bold space-x-2">
              <FiHome className="w-6 h-6" />
              <span>Companies</span>
            </span>
          )}
        </div>

        {activeTab === "jobs" && (
          <div>
            {loading && <p>Loading jobs...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
              <CustomTable
                data={jobs}
                columns={["Title", "Posted Date", "Applications"]}
              />
            )}
          </div>
        )}
        {activeTab === "applicants" && (
          <div>
            {loading && <p>Loading applicants...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
              <CustomTable
                data={applicants}
                columns={["Name", "Job", "Status"]}
              />
            )}
          </div>
        )}
        {activeTab === "companies" && (
          <div>
            {loading && <p>Loading companies...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
              <CustomTable data={companies} columns={["Name", "Admin Email"]} />
            )}
          </div>
        )}
      </main>

      <AddButton onClick={handleAddJob} />
    </div>
  );
}
