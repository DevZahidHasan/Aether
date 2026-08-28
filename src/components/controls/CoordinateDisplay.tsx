import React from "react";
import type { GeoCoordinate } from "@/types/spatial";

export interface CoordinateDisplayProps {
  coordinate?: GeoCoordinate;
  className?: string;
}

export function CoordinateDisplay({
  coordinate = { longitude: 0, latitude: 20 },
  className = "",
}: CoordinateDisplayProps) {
  const latStr = `${Math.abs(coordinate.latitude).toFixed(2)}° ${coordinate.latitude >= 0 ? "N" : "S"}`;
  const lonStr = `${Math.abs(coordinate.longitude).toFixed(2)}° ${coordinate.longitude >= 0 ? "E" : "W"}`;

  return (
    <div
      aria-label={`Current center coordinates: ${latStr} ${lonStr}`}
      className={`font-mono text-[11px] text-aether-fg-muted bg-aether-surface border border-aether-border rounded-sm px-2.5 py-1 select-none pointer-events-none ${className}`}
    >
      <span>{latStr}</span>
      <span className="mx-1.5 text-aether-border-interactive">·</span>
      <span>{lonStr}</span>
    </div>
  );
}
