import { AdminHeader } from "@/components/layout/AdminHeader";
import { PageContainer } from "@/components/PageContainer";
import { SectionCard } from "@/components/SectionCard";
import { StatusBadge } from "@/components/StatusBadge";
import type { OrderStatus } from "@/types";

export const metadata = { title: "Orders — Admin — Pizza3.14" };

// Placeholder rows — replaced with DB data in Milestone 4
const PLACEHOLDER_ROWS: {
  id: number;
  tableId: number;
  status: OrderStatus;
  price: string;
  layers: number;
  createdAt: string;
}[] = [
  { id: 8, tableId: 2, status: "NEW", price: "$12.40", layers: 4, createdAt: "just now" },
  { id: 7, tableId: 5, status: "BAKING", price: "$9.80", layers: 3, createdAt: "6 min ago" },
  { id: 6, tableId: 1, status: "SERVED", price: "$15.20", layers: 5, createdAt: "22 min ago" },
  { id: 5, tableId: 3, status: "SERVED", price: "$11.00", layers: 4, createdAt: "31 min ago" },
];

export default function AdminOrdersPage() {
  return (
    <>
      <AdminHeader
        title="Orders"
        description="All orders across all tables and statuses."
      />
      <PageContainer>
        <SectionCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Order", "Table", "Status", "Items", "Price", "Time"].map((h) => (
                    <th
                      key={h}
                      className="pb-3 pr-6 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLACEHOLDER_ROWS.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-3 pr-6 font-mono text-foreground">
                      #{row.id}
                    </td>
                    <td className="py-3 pr-6 text-muted-foreground">
                      Table {row.tableId}
                    </td>
                    <td className="py-3 pr-6">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="py-3 pr-6 text-muted-foreground">
                      {row.layers} layers
                    </td>
                    <td className="py-3 pr-6 font-mono text-foreground">
                      {row.price}
                    </td>
                    <td className="py-3 text-muted-foreground">{row.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Live data from DB in Milestone 4
          </p>
        </SectionCard>
      </PageContainer>
    </>
  );
}
