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

// Helper to rewrite IPFS image URLs
const pinataRewriteUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  try {
    const cidMatch = url.match(/ipfs\/([^/]+)/);
    const cid = cidMatch?.[1];
    return cid
      ? `https://silver-accepted-barracuda-955.mypinata.cloud/ipfs/${cid}`
      : url;
  } catch {
    return url;
  }
};

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
  const { data: session, status } = useSession();

  const fetchProfile = async () => {
    if (!email) {
      console.error("Profile: No email provided");
      setLoading(false);
      return;
    }

    try {
      console.log("Profile: Fetching profile for email:", email);
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch profile");
      }
      const data: UserProfile = await response.json();
      console.log("Profile: Fetched user:", data);
      console.log("Profile: Fetched image URL:", data.image);
      setUser(data);
    } catch (error) {
      console.error("Profile: Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    window.addEventListener("profileUpdated", fetchProfile);
    return () => window.removeEventListener("profileUpdated", fetchProfile);
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

  if (status === "loading") {
    return <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse" />;
  }

  if (!session || !session.user.email) {
    router.push("/login");
    return null;
  }

  if (loading) {
    return <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse" />;
  }

  const displayName = user?.name || email;
  const initial = displayName.charAt(0).toUpperCase();
  const profileImage = pinataRewriteUrl(user?.image);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-green-100 overflow-hidden flex items-center cursor-pointer hover:opacity-80">
          {profileImage ? (
            <Image
              src={profileImage}
              alt="Profile"
              fill
              className="object-cover"
              onError={() =>
                setUser((prev) => (prev ? { ...prev, image: null } : null))
              }
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
          <FiUser className="mr-2" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSettingsClick}
          className="cursor-pointer"
        >
          <FiSettings className="mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <FiLogOut className="mr-2" />
          Logout
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
