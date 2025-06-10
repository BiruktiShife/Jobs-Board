import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

type Status = "PENDING" | "APPROVED" | "REJECTED";

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
      text: "Pending",
    },
    APPROVED: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
      text: "Approved",
    },
    REJECTED: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
      text: "Rejected",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 px-2 py-1 ${config.color}`}
    >
      <Icon className="w-3 h-3" />
      {config.text}
    </Badge>
  );
}
