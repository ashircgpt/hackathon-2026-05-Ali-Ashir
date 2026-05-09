import PizzaBuilder from "@/components/pizza-builder/PizzaBuilder";

interface TablePageProps {
  params: { tableId: string };
}

export function generateMetadata({ params }: TablePageProps) {
  return { title: `Table ${params.tableId} — Pizza3.14` };
}

export default function TablePage({ params }: TablePageProps) {
  return <PizzaBuilder tableId={params.tableId} />;
}
