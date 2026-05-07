import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  className?: string;
  /** Highlight the value in primary (orange) color */
  highlight?: boolean;
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  className,
  highlight = false,
}: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p
              className={cn(
                "mt-1 truncate text-2xl font-bold tabular-nums",
                highlight ? "text-primary" : "text-foreground",
              )}
            >
              {value}
            </p>
            {sub && (
              <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
            )}
          </div>
          {icon && (
            <div className="shrink-0 rounded-md bg-accent p-2 text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
