import React from "react";

export interface ScaleBarProps {
  zoom?: number;
  className?: string;
}

export function ScaleBar({ zoom = 1.0, className = "" }: ScaleBarProps) {
  // Approximate scale calculation based on zoom level
  const distanceKm = Math.round(5000 / Math.max(zoom, 0.1));
  const displayLabel = distanceKm >= 1000 ? `${(distanceKm / 1000).toFixed(0)} 000 km` : `${distanceKm} km`;

  return (
    <div
      aria-label={`Map scale: ${displayLabel}`}
      className={`flex flex-col items-end gap-1 select-none pointer-events-none ${className}`}
    >
      <div className="relative w-20 h-2 flex items-center justify-center">
        {/* Horizontal scale line */}
        <div className="w-full h-[1px] bg-aether-fg-muted relative">
          {/* Left tick */}
          <div className="absolute left-0 -top-1 w-[1px] h-2.5 bg-aether-fg-muted" />
          {/* Right tick */}
          <div className="absolute right-0 -top-1 w-[1px] h-2.5 bg-aether-fg-muted" />
        </div>
      </div>
      <span className="font-mono text-[10px] text-aether-fg-muted">
        {displayLabel}
      </span>
    </div>
  );
}
