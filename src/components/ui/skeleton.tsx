import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

function TableSkeleton() {
  return (
    <div className="w-full rounded-lg bg-white shadow-sm">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-50 py-3">
          <div className="grid grid-cols-5 gap-4 px-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>

        {/* Rows */}
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="py-4">
            <div className="grid grid-cols-5 gap-4 px-6">
              {[1, 2, 3, 4, 5].map((col) => (
                <div key={col} className="h-4 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { Skeleton, TableSkeleton };
