"use client";

interface Props {
  stepLabel: string;
  helper: string;
  selectedCount?: number;
  selectedNoun?: string;
}

export default function OrbitStep({
  stepLabel,
  helper,
  selectedCount,
  selectedNoun,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-[10px] font-mono uppercase tracking-widest text-cheese">
        {stepLabel}
      </p>
      <p className="text-xs text-cream/65 text-center max-w-md">{helper}</p>
      {typeof selectedCount === "number" && (
        <p className="text-[10px] font-mono text-ember mt-0.5">
          {selectedCount} {selectedNoun}
          {selectedCount === 1 ? "" : "s"} on the pizza
        </p>
      )}
    </div>
  );
}
