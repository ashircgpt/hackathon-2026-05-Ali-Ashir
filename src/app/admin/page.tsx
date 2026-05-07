import {
  ClipboardList,
  TrendingUp,
  MessageSquare,
  Link2,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { PageContainer } from "@/components/PageContainer";
import { StatCard } from "@/components/StatCard";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import type { OrderStatus } from "@/types";

export const metadata = { title: "Admin — Pizza3.14" };

const PLACEHOLDER_STATS = [
  { label: "Total Orders", value: "—", icon: <ClipboardList className="h-4 w-4" /> },
  { label: "Revenue", value: "—", icon: <TrendingUp className="h-4 w-4" /> },
  { label: "Feedback", value: "—", icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Chain Status", value: "—", icon: <Link2 className="h-4 w-4" /> },
];

const STATUS_OVERVIEW: { status: OrderStatus; count: number }[] = [
  { status: "NEW", count: 0 },
  { status: "PREPARING", count: 0 },
  { status: "BAKING", count: 0 },
  { status: "READY", count: 0 },
  { status: "SERVED", count: 0 },
];

export default function AdminOverviewPage() {
  return (
    <>
      <AdminHeader
        title="Overview"
        description="Pizza3.14 operations at a glance."
      />
      <PageContainer>
        {/* Stat grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLACEHOLDER_STATS.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              sub="Live data in Milestone 4"
            />
          ))}
        </div>

        {/* Status breakdown */}
        <SectionCard
          title="Orders by Status"
          description="Live breakdown — active in Milestone 4"
          className="mt-6"
        >
          <div className="flex flex-wrap gap-3">
            {STATUS_OVERVIEW.map(({ status, count }) => (
              <div
                key={status}
                className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2"
              >
                <StatusBadge status={status} />
                <span className="font-mono text-sm font-semibold text-foreground">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Top combo placeholder */}
        <SectionCard
          title="Most Famous Combo"
          description="The most ordered pizza configuration"
          className="mt-4"
          accented
        >
          <p className="text-sm text-muted-foreground">
            Calculated from verified feedback orders — available in Milestone 4
          </p>
        </SectionCard>
      </PageContainer>
    </>
  );
}
