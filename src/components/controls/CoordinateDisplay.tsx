import React from "react";
import type { GeoCoordinate } from "@/types/spatial";

export interface CoordinateDisplayProps {
  coordinate?: GeoCoordinate;
  activeLayerValue?: string | null;
  activeLayerReadouts?: { value: string; colorClass?: string }[];
  className?: string;
}

export const CoordinateDisplay = React.memo(function CoordinateDisplay({
  coordinate = { longitude: 0, latitude: 20 },
  activeLayerValue,
  activeLayerReadouts,
  className = "",
}: CoordinateDisplayProps) {
  const latStr = `${Math.abs(coordinate.latitude).toFixed(2)}° ${coordinate.latitude >= 0 ? "N" : "S"}`;
  const lonStr = `${Math.abs(coordinate.longitude).toFixed(2)}° ${coordinate.longitude >= 0 ? "E" : "W"}`;

  return (
    <div
      aria-label={`Current center coordinates: ${latStr} ${lonStr}`}
      className={`font-mono text-[11px] text-aether-fg-muted bg-aether-surface border border-aether-border rounded-sm px-3 py-1 select-none pointer-events-none flex items-center gap-1.5 shadow-md ${className}`}
    >
      <span>{latStr}</span>
      <span className="text-aether-border-interactive">·</span>
      <span>{lonStr}</span>
      {activeLayerReadouts && activeLayerReadouts.length > 0 ? (
        activeLayerReadouts.map((item, idx) => (
          <React.Fragment key={idx}>
            <span className="text-aether-border-interactive">·</span>
            <span className={`font-semibold tracking-wide ${item.colorClass ?? "text-aether-accent"}`}>
              {item.value}
            </span>
          </React.Fragment>
        ))
      ) : activeLayerValue ? (
        <>
          <span className="text-aether-border-interactive">·</span>
          <span className="font-semibold text-aether-accent tracking-wide">{activeLayerValue}</span>
        </>
      ) : null}
    </div>
  );
});
