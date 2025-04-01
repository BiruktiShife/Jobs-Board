import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FiBriefcase, FiBookmark } from "react-icons/fi";

interface HeaderProps {
  activeTab: "jobs" | "bookmarks" | "dashboard";
  email: string;
}
interface ProfileProps {
  email: string;
}
export function Profile({ email }: ProfileProps) {
  return (
    <div className="flex items-center space-x-4">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt={email} />{" "}
        <AvatarFallback>{email[0].toUpperCase()}</AvatarFallback>
      </Avatar>
    </div>
  );
}

export function Header({ activeTab, email }: HeaderProps) {
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

      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt={email} />{" "}
          <AvatarFallback>{email[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
