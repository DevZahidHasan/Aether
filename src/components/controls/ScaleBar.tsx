import React from "react";

export interface ScaleBarProps {
  zoom?: number;
  className?: string;
}

export const ScaleBar = React.memo(function ScaleBar({ zoom = 1.0, className = "" }: ScaleBarProps) {
  // Convert zoom factor into calibrated cartographic distance in kilometers
  const effectiveZoom = Math.max(0.4, zoom);
  const rawKm = 5000 / effectiveZoom;

  // Graduated cartographic distance steps
  let distanceKm = 5000;
  if (rawKm >= 4200) distanceKm = 5000;
  else if (rawKm >= 3200) distanceKm = 4000;
  else if (rawKm >= 2400) distanceKm = 3000;
  else if (rawKm >= 1800) distanceKm = 2000;
  else if (rawKm >= 1200) distanceKm = 1500;
  else if (rawKm >= 750) distanceKm = 1000;
  else if (rawKm >= 400) distanceKm = 500;
  else if (rawKm >= 200) distanceKm = 250;
  else distanceKm = 100;

  // Format with space thousands separator (e.g. "5 000 km", "500 km")
  const displayLabel =
    distanceKm >= 1000
      ? `${Math.floor(distanceKm / 1000)} ${String(distanceKm % 1000).padStart(3, "0")} km`
      : `${distanceKm} km`;

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
      <span className="font-mono text-[10px] text-aether-fg-muted font-medium transition-all duration-150">
        {displayLabel}
      </span>
    </div>
  );
});
