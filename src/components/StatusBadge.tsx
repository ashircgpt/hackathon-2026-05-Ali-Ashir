import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const statusStyles: Record<OrderStatus, string> = {
  NEW: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  PREPARING: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  BAKING: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  READY: "bg-green-500/15 text-green-300 border-green-500/30",
  SERVED: "bg-teal-500/15 text-teal-300 border-teal-500/30",
};

const statusLabels: Record<OrderStatus, string> = {
  NEW: "New",
  PREPARING: "Preparing",
  BAKING: "Baking",
  READY: "Ready",
  SERVED: "Served",
};

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
