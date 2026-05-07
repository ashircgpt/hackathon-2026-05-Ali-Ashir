import { UtensilsCrossed } from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { PageContainer } from "@/components/PageContainer";
import { SectionCard } from "@/components/SectionCard";
import type { LayerType } from "@/types";

export const metadata = { title: "Menu — Admin — Pizza3.14" };

const LAYER_GROUPS: { type: LayerType; label: string; count: number }[] = [
  { type: "BASE", label: "Bases", count: 3 },
  { type: "SAUCE", label: "Sauces", count: 4 },
  { type: "CHEESE", label: "Cheeses", count: 3 },
  { type: "TOPPING", label: "Toppings", count: 6 },
];

export default function AdminMenuPage() {
  return (
    <>
      <AdminHeader
        title="Menu"
        description="Ingredient catalogue — 16 items across 4 layer types."
      />
      <PageContainer>
        <div className="grid gap-4 sm:grid-cols-2">
          {LAYER_GROUPS.map(({ type, label, count }) => (
            <SectionCard
              key={type}
              title={label}
              description={`${count} items`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">
                    {type}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Editable in post-hackathon roadmap
                </span>
              </div>
            </SectionCard>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Seed data loaded in Milestone 1. Menu editing is out of scope for
          the hackathon — see docs/POST_HACKATHON_ROADMAP.md.
        </p>
      </PageContainer>
    </>
  );
}
