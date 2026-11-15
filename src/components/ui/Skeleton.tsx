interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className = "", width, height }: SkeletonProps) {
  return (
    <div
      className={["bg-border animate-pulse rounded", className].join(" ")}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className = "" }: SkeletonTextProps) {
  const widths = ["w-full", "w-5/6", "w-4/6", "w-3/4", "w-2/3"];
  return (
    <div className={["space-y-2", className].join(" ")} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={[
            "h-4 bg-border animate-pulse rounded",
            widths[i % widths.length],
          ].join(" ")}
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div
      className={[
        "border border-border rounded p-4 bg-offWhite space-y-3",
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      <div className="h-5 w-2/5 bg-border animate-pulse rounded" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-border animate-pulse rounded" />
        <div className="h-4 w-5/6 bg-border animate-pulse rounded" />
        <div className="h-4 w-4/6 bg-border animate-pulse rounded" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-9 w-24 bg-border animate-pulse rounded" />
        <div className="h-9 w-20 bg-border animate-pulse rounded" />
      </div>
    </div>
  );
}
