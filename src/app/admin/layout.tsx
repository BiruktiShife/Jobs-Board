"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Building2, Users, Briefcase } from "lucide-react";
import { CompactFooter } from "@/utils/footer";

const navigation = [
  {
    name: "Companies",
    href: "/admin/companies",
    icon: Building2,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Jobs",
    href: "/admin/jobs",
    icon: Briefcase,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8" aria-label="Tabs">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? "text-green-600 bg-green-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                    "group inline-flex items-center py-4 px-4 text-sm font-medium rounded-t-lg transition-colors"
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive
                        ? "text-green-500"
                        : "text-gray-400 group-hover:text-gray-500",
                      "h-5 w-5 mr-2"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <CompactFooter />
    </div>
  );
}
