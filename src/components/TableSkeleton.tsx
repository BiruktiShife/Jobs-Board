import React from "react";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-50 py-3">
          <div
            className="grid gap-4 px-6"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, i) => (
              <div
                key={`header-${i}`}
                className="h-4 bg-gray-200 rounded"
              ></div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="py-4 even:bg-gray-50">
              <div
                className="grid gap-4 px-6"
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="h-4 bg-gray-100 rounded"
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
