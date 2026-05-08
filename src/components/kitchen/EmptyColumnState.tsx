export default function EmptyColumnState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-2 opacity-40 animate-pulse">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8 text-smoke"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
      </svg>
      <p className="text-xs text-smoke tracking-wide">Queue clear</p>
    </div>
  );
}
