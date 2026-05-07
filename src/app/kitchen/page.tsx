import { ChefHat, Clock } from "lucide-react";
import { PageContainer } from "@/components/PageContainer";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import type { OrderStatus } from "@/types";

export const metadata = { title: "Kitchen — Pizza3.14" };

// Placeholder order cards — replaced with live data in Milestone 3
const PLACEHOLDER_ORDERS: {
  id: number;
  tableId: number;
  status: OrderStatus;
  elapsed: string;
  layers: string[];
}[] = [
  { id: 1, tableId: 3, status: "BAKING", elapsed: "8 min", layers: ["Classic Dough", "Marinara", "Mozzarella", "Pepperoni"] },
  { id: 2, tableId: 7, status: "PREPARING", elapsed: "3 min", layers: ["Whole Wheat", "Pesto", "Vegan Cheese", "Mushrooms", "Bell Peppers"] },
  { id: 3, tableId: 1, status: "NEW", elapsed: "1 min", layers: ["Cauliflower Crust", "BBQ", "Double Cheddar"] },
  { id: 4, tableId: 5, status: "READY", elapsed: "14 min", layers: ["Classic Dough", "Garlic Cream", "Mozzarella", "Jalapeños"] },
];

export default function KitchenPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <ChefHat className="h-5 w-5 text-primary" aria-hidden />
          <span className="font-semibold">
            Pizza<span className="text-primary">3.14</span>
          </span>
          <span className="ml-2 rounded bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            KITCHEN
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          <span>Live polling every 5 s — active in Milestone 3</span>
        </div>
      </header>

      <PageContainer width="full">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">
            Active Orders
          </h1>
          <span className="text-sm text-muted-foreground">
            {PLACEHOLDER_ORDERS.length} orders
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PLACEHOLDER_ORDERS.map((order) => (
            <SectionCard key={order.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2 p-5 pb-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Table #{order.tableId} · Order #{order.id}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden />
                    {order.elapsed} ago
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="border-t border-border px-5 py-3">
                <ul className="space-y-0.5">
                  {order.layers.map((l) => (
                    <li key={l} className="text-xs text-muted-foreground">
                      • {l}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-5 pb-4 pt-3">
                <button
                  disabled
                  className="w-full cursor-not-allowed rounded-md bg-primary/20 px-3 py-2 text-xs font-medium text-primary/50"
                >
                  Advance Status — active in Milestone 3
                </button>
              </div>
            </SectionCard>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
