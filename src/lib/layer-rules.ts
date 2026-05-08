import type { MenuItem } from "@/types";

// BASE/SAUCE/CHEESE: replace existing of same type if present.
// TOPPING: always append (no limit).
export function addLayer(current: MenuItem[], candidate: MenuItem): MenuItem[] {
  if (candidate.layerType === "TOPPING") {
    return [...current, candidate];
  }
  // Replace any existing item of the same type
  const without = current.filter((l) => l.layerType !== candidate.layerType);
  return [...without, candidate];
}

// Remove a layer by menu item id.
export function removeLayer(current: MenuItem[], id: number): MenuItem[] {
  return current.filter((l) => l.id !== id);
}

// Returns true if the selection contains at least one BASE layer.
export function hasBase(layers: MenuItem[]): boolean {
  return layers.some((l) => l.layerType === "BASE");
}

// Returns true if this exact menu item is already in the selection.
export function isSelected(layers: MenuItem[], id: number): boolean {
  return layers.some((l) => l.id === id);
}

// Assign display z-indexes for canvas rendering.
// Mirrors server logic: BASE=0, SAUCE=1, CHEESE=2, TOPPING=3+n
export function assignZIndexes(
  layers: MenuItem[],
): Array<MenuItem & { zIndex: number }> {
  let toppingIdx = 0;
  return layers.map((item) => {
    let zIndex: number;
    if (item.layerType === "BASE") zIndex = 0;
    else if (item.layerType === "SAUCE") zIndex = 1;
    else if (item.layerType === "CHEESE") zIndex = 2;
    else zIndex = 3 + toppingIdx++;
    return { ...item, zIndex };
  });
}
