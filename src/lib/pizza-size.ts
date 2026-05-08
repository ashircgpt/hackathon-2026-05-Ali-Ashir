export type PizzaSize = "SMALL" | "MEDIUM" | "LARGE";

export const SIZE_MULTIPLIERS: Record<PizzaSize, number> = {
  SMALL: 0.85,
  MEDIUM: 1,
  LARGE: 1.25,
};

export const SIZE_LABELS: Record<PizzaSize, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
};

export const SIZE_SHORT_LABELS: Record<PizzaSize, string> = {
  SMALL: "S",
  MEDIUM: "M",
  LARGE: "L",
};

// Tailwind size classes for the circular pizza canvas container.
// Desktop-first — canvas is the hero of the tabletop experience.
export const SIZE_CANVAS_CLASS: Record<PizzaSize, string> = {
  SMALL:  "w-[420px] h-[420px]",
  MEDIUM: "w-[560px] h-[560px]",
  LARGE:  "w-[680px] h-[680px]",
};
