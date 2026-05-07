import { Pizza, ShoppingCart } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { SectionCard } from "@/components/SectionCard";
import { Button } from "@/components/ui/button";

interface TablePageProps {
  params: { tableId: string };
}

export function generateMetadata({ params }: TablePageProps) {
  return { title: `Table ${params.tableId} — Pizza3.14` };
}

export default function TablePage({ params }: TablePageProps) {
  const { tableId } = params;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <Pizza className="h-5 w-5 text-primary" aria-hidden />
          <span className="font-semibold">
            Pizza<span className="text-primary">3.14</span>
          </span>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          Table #{tableId}
        </span>
      </header>

      {/* Main */}
      <PageContainer width="full" className="flex flex-1 flex-col">
        {/* Placeholder content — replaced in Milestone 2 */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
          <div className="rounded-full bg-primary/10 p-6">
            <Pizza className="h-16 w-16 text-primary" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Pizza Builder
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag your ingredients • Build your perfect pizza
            </p>
          </div>

          <div className="grid w-full max-w-lg gap-3">
            <SectionCard
              title="🍕 Your Canvas"
              description="Drop ingredients here to build your pizza"
            >
              <div className="flex h-32 items-center justify-center rounded-md border-2 border-dashed border-border">
                <p className="text-sm text-muted-foreground">
                  Pizza canvas — coming in Milestone 2
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Nutrition" description="Live totals update as you build">
              <div className="grid grid-cols-5 gap-2 text-center">
                {["Price", "Kcal", "Protein", "Fats", "Carbs"].map((label) => (
                  <div key={label}>
                    <p className="text-lg font-bold text-foreground">—</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <Button disabled size="lg" className="w-full max-w-lg">
            <ShoppingCart className="h-4 w-4" aria-hidden />
            Place Order
          </Button>
          <p className="text-xs text-muted-foreground">
            Add at least one base layer to enable ordering
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
