'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LayerItemCard } from "./LayerItemCard";
import { isSelected } from "@/lib/layer-rules";
import type { MenuItem } from "@/types";

const TABS = [
  { value: "BASE",    label: "Base" },
  { value: "SAUCE",   label: "Sauce" },
  { value: "CHEESE",  label: "Cheese" },
  { value: "TOPPING", label: "Toppings" },
] as const;

interface LayerPaletteProps {
  items: MenuItem[];
  selectedLayers: MenuItem[];
  onAdd: (item: MenuItem) => void;
}

export function LayerPalette({ items, selectedLayers, onAdd }: LayerPaletteProps) {
  return (
    <Tabs defaultValue="BASE" className="flex flex-col">
      <TabsList className="shrink-0 flex gap-1 rounded-none bg-transparent px-4 pt-2 pb-0 border-b border-border/40 justify-start h-auto">
        {TABS.map(({ value, label }) => {
          const count = items.filter((i) => i.layerType === value).length;
          return (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-t-lg rounded-b-none px-4 py-1.5 text-xs font-semibold border border-b-0 border-transparent data-[state=active]:border-border/40 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground gap-1.5 transition-colors"
            >
              {label}
              <Badge
                variant="secondary"
                className="text-[9px] h-4 px-1.5 py-0 min-w-[1rem]"
              >
                {count}
              </Badge>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {TABS.map(({ value }) => (
        <TabsContent key={value} value={value} className="mt-0">
          <div className="flex gap-3 overflow-x-auto px-4 py-3">
            {items
              .filter((item) => item.layerType === value)
              .map((item) => (
                <div key={item.id} className="shrink-0 w-44">
                  <LayerItemCard
                    item={item}
                    isSelected={isSelected(selectedLayers, item.id)}
                    onAdd={onAdd}
                  />
                </div>
              ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
