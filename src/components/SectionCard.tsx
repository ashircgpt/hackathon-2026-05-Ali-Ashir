import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SectionCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** Adds a subtle left-border accent in primary color */
  accented?: boolean;
}

export function SectionCard({
  title,
  description,
  children,
  className,
  contentClassName,
  accented = false,
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        accented && "border-l-2 border-l-primary",
        className,
      )}
    >
      {(title ?? description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn(!title && !description && "pt-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
