// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiBriefcase, FiBookmark } from "react-icons/fi";
import Image from "next/image";

interface HeaderProps {
  activeTab: "jobs" | "bookmarks" | "dashboard";
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

  if (loading) {
    return <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse" />;
  }

  const displayName = user?.name || email;
  const initial = displayName.charAt(0).toUpperCase();
  const profileImage = user?.image;
  return (
    <div
      onClick={handleProfileClick}
      className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
    >
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
  );
}

export function Header({ activeTab }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-2">
        {activeTab === "jobs" && (
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

      {/* <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt={email} />{" "}
          <AvatarFallback>{email[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      </div> */}
    </div>
  );
}
