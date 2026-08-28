import React from "react";
import type { GeoCoordinate, ProjectionType } from "@/types/spatial";

export interface SpatialViewportProps {
  center?: GeoCoordinate;
  zoom?: number;
  projection?: ProjectionType;
  className?: string;
  children?: React.ReactNode;
}

export function SpatialViewport({
  center = { longitude: 0, latitude: 20 },
  zoom = 1.0,
  projection = "globe-3d",
  className = "",
  children,
}: SpatialViewportProps) {
  // Format coordinate display in scientific notation
  const latStr = `${Math.abs(center.latitude).toFixed(2)}° ${center.latitude >= 0 ? "N" : "S"}`;
  const lonStr = `${Math.abs(center.longitude).toFixed(2)}° ${center.longitude >= 0 ? "E" : "W"}`;

  return (
    <main
      role="region"
      aria-label="Planetary spatial viewport"
      className={`relative w-full h-full overflow-hidden bg-aether-bg select-none ${className}`}
    >
      {/* 
        WebGL Spatial Engine Mount Point (Phase 3)
        Will mount Three.js / React Three Fiber Canvas here.
      */}
      <div
        id="aether-spatial-engine"
        className="absolute inset-0 z-globe flex items-center justify-center pointer-events-auto"
      >
        {children || (
          <div className="relative flex flex-col items-center justify-center pointer-events-none opacity-40">
            {/* Minimal Instrument Reticle */}
            <div className="w-64 h-64 border border-dashed border-aether-border rounded-full flex items-center justify-center">
              <div className="w-32 h-32 border border-aether-border-subtle rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-aether-accent opacity-60" />
              </div>
            </div>
            <div className="mt-4 font-mono text-[11px] tracking-widest text-aether-fg-muted uppercase">
              Spatial Engine [Mount: {projection}]
            </div>
          </div>
        )}
      </div>

      {/* Spatial Telemetry Readout Overlay (Bottom Left) */}
      <div
        className="absolute bottom-16 left-4 z-controls flex flex-col gap-1 font-mono text-[11px] text-aether-fg-muted pointer-events-none"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <span className="text-aether-fg-secondary">COORDINATES:</span>
          <span>{latStr}, {lonStr}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-aether-fg-secondary">SCALE:</span>
          <span>{zoom.toFixed(2)}× LOD: GLOBAL</span>
        </div>
      </div>
    </main>
  );
}
