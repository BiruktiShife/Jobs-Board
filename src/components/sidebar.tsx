"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  FiLogOut,
  FiSettings,
  FiBookmark,
  FiUsers,
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SidebarProps<T extends string> {
  activeTab: T;
  onTabChange: (tab: T) => void;
  role: "admin" | "candidate";
}

export function Sidebar<T extends string>({
  activeTab,
  onTabChange,
  role,
}: SidebarProps<T>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCollapseButton, setShowCollapseButton] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 768) {
          setIsCollapsed(true);
          setShowCollapseButton(false);
        } else {
          setIsCollapsed(false);
          setShowCollapseButton(true);
        }
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const tabs =
    role === "admin" ? ["jobs", "applicants"] : ["jobs", "bookmarks"];

  const handleLogout = async () => {
    await signOut({ redirect: false }); // Sign out without immediate redirect
    router.push("/login"); // Manually redirect to login page
  };

  return (
    <aside
      className={`transition-width duration-300 bg-gray-900 text-white p-6 ${
        isCollapsed ? "w-20" : "w-64"
      } flex flex-col justify-between relative`}
    >
      {showCollapseButton && (
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white rounded-l-md p-2"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      )}

      <div>
        {!isCollapsed && (
          <div className="flex items-center mb-6">
            {role === "candidate" ? (
              <Link
                href="/dashboard"
                className="flex items-center cursor-pointer"
              >
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={90}
                  height={20}
                  className="flex-shrink-0"
                />
                <span className="text-2xl font-bold text-green-600 hidden md:block ml-2">
                  JobBoard
                </span>
              </Link>
            ) : (
              <div className="flex items-center mb-6">
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={90}
                  height={20}
                  className="flex-shrink-0"
                />
                <span className="text-2xl font-bold text-green-600 hidden md:block ml-2">
                  JobBoard
                </span>
              </div>
            )}
          </div>
        )}
        <nav>
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              className={`w-full justify-start mb-2 ${
                activeTab === tab ? "bg-gray-600" : ""
              } flex items-center space-x-2 px-2`}
              onClick={() => onTabChange(tab as T)}
            >
              {isCollapsed ? null : (
                <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              )}
              {isCollapsed ? <IconForTab tab={tab} /> : null}
            </Button>
          ))}
        </nav>
      </div>

      <div>
        <Button
          variant="ghost"
          className="w-full justify-start mb-2 flex items-center space-x-2 px-2"
        >
          {!isCollapsed && <span>Settings</span>}
          {isCollapsed && <FiSettings />}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start flex items-center space-x-2 px-2"
          onClick={handleLogout} // Add logout handler
        >
          {!isCollapsed && <span>Logout</span>}
          {isCollapsed && <FiLogOut />}
        </Button>
      </div>
    </aside>
  );
}

function IconForTab({ tab }: { tab: string }) {
  switch (tab) {
    case "jobs":
      return <FiBriefcase className="w-5 h-5" />;
    case "applicants":
      return <FiUsers className="w-5 h-5" />;
    case "bookmarks":
      return <FiBookmark className="w-5 h-5" />;
    default:
      return null;
  }
}
