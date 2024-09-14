import { LockClosedIcon, DocumentCheckIcon, EllipsisHorizontalCircleIcon } from "@heroicons/react/20/solid";
import { CheckCircleIcon, LockOpenIcon, MinusCircleIcon } from "lucide-react";
import { memo } from "react";

type StatusConfig = {
  [key: string]: {
    icon: React.ElementType;
    color: string;
  };
};

const statusConfig: StatusConfig = {
  open: { icon: LockOpenIcon, color: "text-green-400" },
  closed: { icon: LockClosedIcon, color: "text-blue-400" },
  accepted: { icon: DocumentCheckIcon, color: "text-gray-400" },
  delivered: { icon: CheckCircleIcon, color: "text-green-400" },
  rejected: { icon: MinusCircleIcon, color: "text-red-400" },
  enroute: { icon: EllipsisHorizontalCircleIcon, color: "text-yellow-400" },
};

interface LoadStatusBadgeProps {
  status: string;
}

export const LoadStatusBadge = memo(({ status }: LoadStatusBadgeProps) => {
  const lowercaseStatus = status.toLowerCase();
  const { icon: Icon, color } = statusConfig[lowercaseStatus] || statusConfig.open;

  return (
    <div className={`flex items-center ${color}`}>
      {Icon && <Icon className="w-5 h-5 mr-1" />}
      <span className="capitalize">{status}</span>
    </div>
  );
});

LoadStatusBadge.displayName = 'LoadStatusBadge';
