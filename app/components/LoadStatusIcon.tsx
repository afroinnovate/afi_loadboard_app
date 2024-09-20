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

interface LoadStatusIconProps {
  status: string;
}

export const LoadStatusIcon = memo(({ status }: LoadStatusIconProps) => {
  const lowercaseStatus = status.toLowerCase();
  const { icon: Icon, color } = statusConfig[lowercaseStatus] || statusConfig.open;

  return <Icon className={`w-5 h-5 ${color}`} />;
});

LoadStatusIcon.displayName = 'LoadStatusIcon';