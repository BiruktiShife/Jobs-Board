// src/components/header.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FiBookmark,
  FiBriefcase,
  FiLogOut,
  FiSettings,
  FiUser,
} from "react-icons/fi";

interface HeaderProps {
  activeTab: "Applied jobs" | "bookmarks" | "dashboard";
  email: string;
}
interface ProfileProps {
  email: string;
}

interface UserProfile {
  name: string;
  email: string;
  image?: string | null;
}

export function Profile({ email }: ProfileProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data: UserProfile = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [email]);

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleSettingsClick = () => {
    router.push("/settings");
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  if (loading) {
    return <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse" />;
  }

  if (!session) {
    return router.push("/login");
  }

  const displayName = user?.name || email;
  const initial = displayName.charAt(0).toUpperCase();
  const profileImage = user?.image;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
          {profileImage ? (
            <Image
              src={profileImage}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
              {initial}
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={handleProfileClick}
          className="cursor-pointer"
        >
          <FiUser />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSettingsClick}
          className="cursor-pointer"
        >
          <FiSettings />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <FiLogOut />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header({ activeTab }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-2">
        {activeTab === "Applied jobs" && (
          <span className="flex items-center space-x-2 text-2xl font-bold text-green-600">
            <FiBriefcase className="w-6 h-6" />
            <span>Jobs</span>
          </span>
        )}
        {activeTab === "bookmarks" && (
          <span className="flex items-center space-x-2 text-2xl font-bold text-green-600">
            <FiBookmark className="w-6 h-6" />
            <span>Bookmarks</span>
          </span>
        )}
      </div>
    </div>
  );
}
