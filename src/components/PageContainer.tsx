import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Use `narrow` for forms/login, `wide` for dashboards (default) */
  width?: "narrow" | "wide" | "full";
}

export function PageContainer({
  children,
  className,
  width = "wide",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6 lg:px-8",
        width === "narrow" && "max-w-md",
        width === "wide" && "max-w-7xl",
        width === "full" && "max-w-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
