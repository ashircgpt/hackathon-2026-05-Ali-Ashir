import { Link2, ShieldCheck } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { PageContainer } from "@/components/PageContainer";
import { SectionCard } from "@/components/SectionCard";

export const metadata = { title: "Ledger — Admin — Pizza3.14" };

export default function AdminLedgerPage() {
  return (
    <>
      <AdminHeader
        title="Feedback Ledger"
        description="Tamper-evident hash chain of all customer feedback."
      />
      <PageContainer>
        {/* Chain validity banner — wired in Milestone 4 */}
        <div className="mb-4 flex items-center gap-3 rounded-md border border-border bg-secondary/50 px-4 py-3">
          <ShieldCheck
            className="h-5 w-5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div>
            <p className="text-sm font-medium text-foreground">
              Chain Validity
            </p>
            <p className="text-xs text-muted-foreground">
              Client-side re-hash verification — active in Milestone 4
            </p>
          </div>
          <span className="ml-auto rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            PENDING
          </span>
        </div>

        <SectionCard
          title="Block Chain"
          description="Each block links to the previous via SHA-256 hash"
        >
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="rounded-full bg-secondary p-4">
              <Link2 className="h-8 w-8 text-muted-foreground" aria-hidden />
            </div>
            <p className="font-medium text-foreground">No blocks yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Every customer review creates a new block. The chain is verified
              here by re-computing SHA-256 hashes client-side.
            </p>
            <div className="mt-2 rounded-md bg-secondary p-3 text-left font-mono text-xs text-muted-foreground">
              <p>Block N:</p>
              <p className="pl-2">prevHash = SHA256(Block N-1)</p>
              <p className="pl-2">contentHash = SHA256(rawText)</p>
              <p className="pl-2">timestamp = ISO 8601 UTC</p>
              <p className="pl-2">blockHash = SHA256(prev + ts + content)</p>
            </div>
          </div>
        </SectionCard>
      </PageContainer>
    </>
  );
}
