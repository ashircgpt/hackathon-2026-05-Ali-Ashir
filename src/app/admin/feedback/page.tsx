import { MessageSquare } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { PageContainer } from "@/components/PageContainer";
import { SectionCard } from "@/components/SectionCard";

export const metadata = { title: "Feedback — Admin — Pizza3.14" };

export default function AdminFeedbackPage() {
  return (
    <>
      <AdminHeader
        title="Feedback"
        description="Customer reviews submitted after orders are served."
      />
      <PageContainer>
        <SectionCard
          title="Customer Feedback"
          description="Collected after each order reaches SERVED status"
        >
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <div className="rounded-full bg-secondary p-4">
              <MessageSquare
                className="h-8 w-8 text-muted-foreground"
                aria-hidden
              />
            </div>
            <p className="font-medium text-foreground">No feedback yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Customer feedback will appear here once orders reach the SERVED
              status. Each review is stored in a tamper-evident hash chain.
            </p>
            <p className="text-xs text-muted-foreground">
              Live data from DB in Milestone 4 · Chain verifier in Milestone 4
            </p>
          </div>
        </SectionCard>
      </PageContainer>
    </>
  );
}
