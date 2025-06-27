"use client";

import { cn } from "@/lib/utils";
import { Loader2, Briefcase, Users, FileText, Building, User, Calendar } from "lucide-react";

interface LoadingProps {
  variant?: "default" | "page" | "card" | "inline" | "overlay";
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  icon?: "briefcase" | "users" | "file" | "building" | "user" | "calendar" | "default";
  className?: string;
}

const iconMap = {
  briefcase: Briefcase,
  users: Users,
  file: FileText,
  building: Building,
  user: User,
  calendar: Calendar,
  default: Loader2,
};

export function Loading({
  variant = "default",
  size = "md",
  text = "Loading...",
  icon = "default",
  className,
}: LoadingProps) {
  const IconComponent = iconMap[icon];

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  if (variant === "page") {
    return (
      <div className={cn(
        "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center",
        className
      )}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse absolute"></div>
                <IconComponent className="w-8 h-8 text-blue-600 animate-spin relative z-10" />
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{text}</h2>
          <p className="text-slate-600">Please wait while we prepare everything for you</p>
          <div className="flex justify-center mt-4 space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn(
        "bg-white rounded-lg shadow-lg border border-slate-200 p-8",
        className
      )}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <IconComponent className={cn("text-white animate-spin", sizeClasses.lg)} />
          </div>
          <h3 className={cn("font-semibold text-slate-800 mb-2", textSizeClasses[size])}>
            {text}
          </h3>
          <div className="flex justify-center space-x-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></div>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "overlay") {
    return (
      <div className={cn(
        "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50",
        className
      )}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <IconComponent className={cn("text-white animate-spin", sizeClasses.lg)} />
            </div>
            <h3 className={cn("font-semibold text-slate-800 mb-2", textSizeClasses[size])}>
              {text}
            </h3>
            <p className="text-slate-600 text-sm">This may take a few moments</p>
            <div className="flex justify-center mt-4 space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <IconComponent className={cn("text-blue-600 animate-spin", sizeClasses[size])} />
        <span className={cn("text-slate-700 font-medium", textSizeClasses[size])}>
          {text}
        </span>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="relative mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <IconComponent className={cn("text-blue-600 animate-spin", sizeClasses[size])} />
        </div>
      </div>
      <p className={cn("text-slate-600 font-medium", textSizeClasses[size])}>
        {text}
      </p>
    </div>
  );
}

// Skeleton loading components for specific content types
export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
          <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="h-6 bg-slate-200 rounded w-20"></div>
        <div className="h-8 bg-slate-200 rounded w-24"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse"></div>
      </div>
      <div className="divide-y divide-slate-200">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-slate-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-slate-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-6 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}
